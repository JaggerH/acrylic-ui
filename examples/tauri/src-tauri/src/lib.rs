use std::sync::atomic::AtomicBool;
use tauri::Manager;

mod capture;

// Whether the window ended up with a translucent backdrop (macOS vibrancy /
// Windows acrylic). False on Linux, and on Windows when "Transparency effects"
// is off. The frontend queries this via `window_translucent` and only then marks
// <html class="vibrancy"> — which flips --background to transparent so the native
// OS acrylic shows through. When false the body stays opaque (a normal app).
struct Translucent(AtomicBool);

#[tauri::command]
fn window_translucent(state: tauri::State<'_, Translucent>) -> bool {
    state.0.load(std::sync::atomic::Ordering::Relaxed)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            window_translucent,
            capture::capture_webview
        ])
        .setup(|app| {
            let translucent = detect_and_apply_translucency(app);
            app.manage(Translucent(AtomicBool::new(translucent)));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Platform-aware backdrop. Returns whether the window ended up translucent.
//   macOS       → NSVisualEffect vibrancy
//   Windows     → acrylic, but ONLY if "Transparency effects" is on (Win11 won't
//                 blur otherwise — the window would just be see-through)
//   Linux/other → no support → opaque fallback
// Any failure / unsupported platform returns false, so the frontend keeps a solid
// background instead of a broken transparent one.
fn detect_and_apply_translucency(app: &tauri::App) -> bool {
    #[cfg(target_os = "macos")]
    {
        use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
        let Some(window) = app.get_webview_window("main") else {
            return false;
        };
        match apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None) {
            Ok(()) => true,
            Err(e) => {
                eprintln!("apply_vibrancy failed: {e} — opaque fallback");
                false
            }
        }
    }
    #[cfg(target_os = "windows")]
    {
        use window_vibrancy::apply_acrylic;
        let Some(window) = app.get_webview_window("main") else {
            return false;
        };
        // Set crisp per-slot taskbar/title-bar icons regardless of vibrancy.
        set_window_icons(&window);
        if !transparency_effects_enabled() {
            eprintln!("Windows 'Transparency effects' is off — opaque fallback");
            return false;
        }
        match apply_acrylic(&window, None) {
            Ok(()) => {
                install_always_active_subclass(&window);
                true
            }
            Err(e) => {
                eprintln!("apply_acrylic failed: {e} — opaque fallback");
                false
            }
        }
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = app;
        false
    }
}

// Set the window's big (taskbar) and small (title-bar) icons SEPARATELY, each
// realized from the .ico frame that best fits its target size. tao's set_icon only
// takes one size and assigns it to both slots, so the small title-bar icon ends up
// a jaggy/blurry downscale of a huge frame (and the taskbar a blurry downscale too).
// Picking per-size pre-rendered frames and realizing a crisp HICON at exactly the
// requested px keeps both crisp. Ported from snapick.
#[cfg(target_os = "windows")]
fn set_window_icons(window: &tauri::WebviewWindow) {
    use windows_sys::Win32::Foundation::HWND;
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        CreateIconFromResourceEx, GetSystemMetrics, SendMessageW, LR_DEFAULTCOLOR, SM_CXICON,
        SM_CXSMICON, WM_SETICON,
    };
    const ICON_SMALL: usize = 0;
    const ICON_BIG: usize = 1;
    const ICO: &[u8] = include_bytes!("../icons/icon.ico");

    // Choose the directory entry closest to `want` (smallest frame >= want, else the
    // largest available), then realize a crisp HICON at exactly `want`.
    unsafe fn hicon_for(ico: &[u8], want: i32) -> isize {
        if ico.len() < 6 {
            return 0;
        }
        let count = u16::from_le_bytes([ico[4], ico[5]]) as usize;
        let mut best: Option<(i32, u32, u32)> = None; // (width, byte_size, offset)
        for i in 0..count {
            let e = 6 + i * 16;
            if e + 16 > ico.len() {
                break;
            }
            let w = if ico[e] == 0 { 256 } else { ico[e] as i32 };
            let size = u32::from_le_bytes([ico[e + 8], ico[e + 9], ico[e + 10], ico[e + 11]]);
            let off = u32::from_le_bytes([ico[e + 12], ico[e + 13], ico[e + 14], ico[e + 15]]);
            let better = match best {
                None => true,
                Some((bw, _, _)) => {
                    if bw < want {
                        w > bw
                    } else {
                        w >= want && w < bw
                    }
                }
            };
            if better {
                best = Some((w, size, off));
            }
        }
        let (_, size, off) = match best {
            Some(b) => b,
            None => return 0,
        };
        let end = off as usize + size as usize;
        if end > ico.len() {
            return 0;
        }
        CreateIconFromResourceEx(
            ico[off as usize..end].as_ptr(),
            size,
            1,           // fIcon = TRUE
            0x0003_0000, // dwVer
            want,
            want,
            LR_DEFAULTCOLOR,
        ) as isize
    }

    let hwnd = match window.hwnd() {
        Ok(h) => h.0 as HWND,
        Err(e) => {
            eprintln!("hwnd unavailable for icon: {e}");
            return;
        }
    };
    unsafe {
        let big = hicon_for(ICO, GetSystemMetrics(SM_CXICON));
        let small = hicon_for(ICO, GetSystemMetrics(SM_CXSMICON));
        if big != 0 {
            SendMessageW(hwnd, WM_SETICON, ICON_BIG, big);
        }
        if small != 0 {
            SendMessageW(hwnd, WM_SETICON, ICON_SMALL, small);
        }
    }
}

// Reads HKCU\…\Themes\Personalize\EnableTransparency. Missing value or read error
// → assume ON (don't punish the common case for a flaky read).
#[cfg(target_os = "windows")]
fn transparency_effects_enabled() -> bool {
    use windows_sys::Win32::System::Registry::{
        RegGetValueW, HKEY_CURRENT_USER, RRF_RT_REG_DWORD,
    };
    let subkey: Vec<u16> =
        "Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize\0"
            .encode_utf16()
            .collect();
    let value: Vec<u16> = "EnableTransparency\0".encode_utf16().collect();
    let mut data: u32 = 0;
    let mut size = std::mem::size_of::<u32>() as u32;
    let status = unsafe {
        RegGetValueW(
            HKEY_CURRENT_USER,
            subkey.as_ptr(),
            value.as_ptr(),
            RRF_RT_REG_DWORD,
            std::ptr::null_mut(),
            &mut data as *mut u32 as *mut core::ffi::c_void,
            &mut size,
        )
    };
    if status == 0 {
        data != 0
    } else {
        true
    }
}

// Intercepts WM_NCACTIVATE and reports the window as always active so DWM keeps
// drawing the acrylic blur even when focus moves to another window. Win11 22H2+
// disables acrylic on inactive windows by default.
#[cfg(target_os = "windows")]
fn install_always_active_subclass(window: &tauri::WebviewWindow) {
    use std::sync::atomic::{AtomicIsize, Ordering};
    use windows_sys::Win32::Foundation::{HWND, LPARAM, LRESULT, WPARAM};
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        CallWindowProcW, SetWindowLongPtrW, GWLP_WNDPROC, WM_NCACTIVATE, WNDPROC,
    };

    static ORIG: AtomicIsize = AtomicIsize::new(0);

    unsafe extern "system" fn subclass(
        hwnd: HWND,
        msg: u32,
        wparam: WPARAM,
        lparam: LPARAM,
    ) -> LRESULT {
        let orig: WNDPROC = std::mem::transmute(ORIG.load(Ordering::Relaxed));
        let w = if msg == WM_NCACTIVATE { 1 } else { wparam };
        CallWindowProcW(orig, hwnd, msg, w, lparam)
    }

    let hwnd = match window.hwnd() {
        Ok(h) => h.0 as HWND,
        Err(e) => {
            eprintln!("hwnd unavailable: {e}");
            return;
        }
    };
    unsafe {
        let prev = SetWindowLongPtrW(hwnd, GWLP_WNDPROC, subclass as *const () as isize);
        ORIG.store(prev, Ordering::Relaxed);
    }
}
