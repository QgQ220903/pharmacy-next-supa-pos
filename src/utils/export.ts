// app/utils/export.ts

/**
 * Chuyển base64 thành Blob và download file
 */
export function downloadFileFromBase64(
  base64: string,
  filename: string,
  contentType: string,
): void {
  try {
    // Decode base64
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    // Tạo và click link download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download file error:", error);
    throw new Error("Không thể tải file xuống");
  }
}
