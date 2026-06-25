// Prevents an extra console window on Windows in release; does nothing on macOS/Linux.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri_playground_lib::run()
}
