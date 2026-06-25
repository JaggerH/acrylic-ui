//! Webview-native screenshot via WebView2 `ICoreWebView2::CapturePreview`.
//!
//! Captures the webview's REAL composited surface straight to a PNG. No
//! foreground, no focus steal. Used for automated visual verification of the
//! vibrancy result. Copied from snapick's capture.rs.
//!
//! NOTE: CapturePreview only completes while the webview is actually compositing
//! — a LOCKED session has no active compositor, so the capture will time out
//! until the screen is unlocked.

#[cfg(windows)]
#[tauri::command]
pub fn capture_webview(webview: tauri::WebviewWindow, path: String) -> Result<String, String> {
    use std::sync::mpsc;
    use webview2_com::CapturePreviewCompletedHandler;
    use webview2_com::Microsoft::Web::WebView2::Win32::COREWEBVIEW2_CAPTURE_PREVIEW_IMAGE_FORMAT_PNG;
    use windows::core::HSTRING;
    use windows::Win32::System::Com::IStream;
    use windows::Win32::UI::Shell::SHCreateStreamOnFileW;

    let (tx, rx) = mpsc::channel::<Result<(), String>>();
    let path_cl = path.clone();
    webview
        .with_webview(move |pw| {
            let kick = || -> Result<(), String> {
                unsafe {
                    let core = pw.controller().CoreWebView2().map_err(|e| e.to_string())?;
                    // STGM_CREATE (0x1000) | STGM_WRITE (0x1).
                    let stream: IStream =
                        SHCreateStreamOnFileW(&HSTRING::from(path_cl.as_str()), 0x0000_1001)
                            .map_err(|e| e.to_string())?;
                    let stream_keep = stream.clone();
                    let tx2 = tx.clone();
                    let handler = CapturePreviewCompletedHandler::create(Box::new(
                        move |result: windows::core::Result<()>| {
                            let _hold = stream_keep;
                            let _ = tx2.send(result.map_err(|e| e.to_string()));
                            Ok(())
                        },
                    ));
                    core.CapturePreview(
                        COREWEBVIEW2_CAPTURE_PREVIEW_IMAGE_FORMAT_PNG,
                        &stream,
                        &handler,
                    )
                    .map_err(|e| e.to_string())?;
                }
                Ok(())
            };
            if let Err(e) = kick() {
                let _ = tx.send(Err(e));
            }
        })
        .map_err(|e| e.to_string())?;

    rx.recv_timeout(std::time::Duration::from_secs(40))
        .map_err(|_| "capture timed out (window not compositing — is the screen locked?)".to_string())?
        .map(|_| path)
}

#[cfg(not(windows))]
#[tauri::command]
pub fn capture_webview(_webview: tauri::WebviewWindow, _path: String) -> Result<String, String> {
    Err("capture_webview is only implemented on Windows".into())
}
