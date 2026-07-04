// 写真のクライアント側圧縮 (NFR-03): 正方形512pxに切り抜いてdataURL化(端末内保存用)
export async function fileToDataUrl(file: File, size = 512): Promise<string> {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const s = Math.max(size / bmp.width, size / bmp.height);
  const w = bmp.width * s;
  const h = bmp.height * s;
  ctx.drawImage(bmp, (size - w) / 2, (size - h) / 2, w, h);
  bmp.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}
