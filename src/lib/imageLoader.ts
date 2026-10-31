/*
  Site photos are resized ahead of time (scripts/image-variants.mjs) and served as plain files.
  Resizing on request took about a second per photo, and every deploy started that work again.
*/
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  if (src.startsWith('/images/') && src.endsWith('.webp')) {
    return `/images/_w/${src.slice('/images/'.length, -'.webp'.length)}-${width}.webp`
  }
  if (src.includes('res.cloudinary.com')) {
    return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
  }
  return src
}
