const MAX_SIDE=640,MAX_CHARS=150000;
/** 업로드한 그림을 640px JPEG로 줄여 data URL로 변환합니다. 저장 공간(LocalStorage)을 아끼기 위해 크기를 제한합니다. */
export async function fileToDataUrl(file:File):Promise<string>{
 if(!/^image\/(jpeg|png|webp|gif|bmp)$/.test(file.type))throw new Error('JPG, PNG, WebP 그림 파일만 사용할 수 있습니다.');
 const bitmap=await createImageBitmap(file),scale=Math.min(1,MAX_SIDE/Math.max(bitmap.width,bitmap.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('그림을 처리할 수 없습니다.');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 for(const q of [.86,.74,.6,.46]){const url=canvas.toDataURL('image/jpeg',q);if(url.length<=MAX_CHARS)return url;}
 throw new Error('그림 용량이 너무 큽니다. 더 작은 그림을 사용해 주세요.');
}
