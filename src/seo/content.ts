/**
 * Search-facing copy for each tool page: the <title>, meta description, a
 * short how-to and a handful of FAQs. Written for people first; keywords
 * appear where they'd naturally be said.
 */
export interface ToolSeo {
  /** Page <title>. Keep under ~60 characters before the site name. */
  title: string;
  /** Meta description, ~150 characters. */
  description: string;
  /** Heading for the how-to block, e.g. "How to merge PDF files". */
  howToTitle: string;
  howTo: string[];
  faq: { q: string; a: string }[];
}

const PRIVACY_FAQ = {
  q: 'Are my files uploaded anywhere?',
  a: 'No. The whole tool runs inside your browser using JavaScript. Your files stay on your device, nothing is sent to a server, and nothing is stored. You can even use it offline once the page has loaded.',
};

const FREE_FAQ = {
  q: 'Is it really free?',
  a: 'Yes. There is no account, no watermark, no file-size tier and no daily limit. Use it as often as you need.',
};

export const TOOL_SEO: Record<string, ToolSeo> = {
  'merge-pdf': {
    title: 'Merge PDF files online, free and private',
    description: 'Combine multiple PDFs into one file in seconds. Drag to reorder, then merge. Free, no sign-up, and your files are never uploaded.',
    howToTitle: 'How to merge PDF files',
    howTo: ['Drop two or more PDF files onto the page, or click to choose them.', 'Drag the files into the order you want them to appear.', 'Click Merge, then download the combined PDF.'],
    faq: [
      { q: 'Can I change the order of the files?', a: 'Yes. Drag any file up or down in the list before you merge. Pages are combined in the order shown.' },
      { q: 'Is there a limit on how many PDFs I can merge?', a: 'No fixed limit. Very large sets are limited only by your device’s memory, which is usually hundreds of pages or more.' },
      { q: 'Will the merged PDF keep the original quality?', a: 'Yes. Pages are copied as they are, so text stays selectable and images keep their resolution.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'split-pdf': {
    title: 'Split PDF into separate files, free',
    description: 'Split a PDF by page ranges, into single pages, or every N pages. Preview pages first. Free, instant, and nothing is uploaded.',
    howToTitle: 'How to split a PDF',
    howTo: ['Drop a PDF onto the page to see its pages.', 'Choose how to split: by page ranges, every page, or every N pages.', 'Click Split and download the files, or everything at once as a ZIP.'],
    faq: [
      { q: 'How do I write page ranges?', a: 'Use commas between files and dashes for ranges, for example “1-3, 4, 5-8” makes three files: pages 1 to 3, page 4, and pages 5 to 8.' },
      { q: 'Can I split every page into its own PDF?', a: 'Yes. Pick “Every page” and each page becomes a separate file, delivered as one ZIP download.' },
      { q: 'Does splitting reduce quality?', a: 'No. Pages are copied exactly, with text, links and images unchanged.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'remove-pages': {
    title: 'Remove pages from a PDF online, free',
    description: 'Delete unwanted pages from a PDF. Click the pages to remove, or type page numbers, then save. Free, private, no upload.',
    howToTitle: 'How to delete pages from a PDF',
    howTo: ['Drop your PDF to see a thumbnail of every page.', 'Click the pages you want to remove, or type their numbers (for example “2, 5-7”).', 'Click Remove and download the new PDF.'],
    faq: [
      { q: 'Does this change my original file?', a: 'No. A new PDF is created with the remaining pages; your original stays untouched on your device.' },
      { q: 'Can I remove several pages at once?', a: 'Yes. Select as many pages as you like, as long as at least one page remains.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'extract-pages': {
    title: 'Extract pages from a PDF, free online',
    description: 'Pull specific pages out of a PDF into a new file, together or one PDF per page. Free, instant, and your file never leaves your device.',
    howToTitle: 'How to extract pages from a PDF',
    howTo: ['Drop your PDF to see its pages.', 'Click the pages you want, or type a range such as “1, 3-5”.', 'Choose one combined PDF or one file per page, then click Extract.'],
    faq: [
      { q: 'What is the difference between extract and split?', a: 'Extract picks the pages you choose and leaves the rest behind. Split cuts the whole document into several files.' },
      { q: 'Can I save each page as a separate PDF?', a: 'Yes. Turn on “One file per page” and you’ll get a ZIP with one PDF per selected page.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'organize-pdf': {
    title: 'Reorder, rotate and delete PDF pages online',
    description: 'Rearrange PDF pages by dragging, rotate or remove individual pages, then save. Free, visual, and nothing is uploaded.',
    howToTitle: 'How to reorder PDF pages',
    howTo: ['Drop your PDF to see every page as a thumbnail.', 'Drag pages into a new order. Hover a page to rotate or remove it.', 'Click Save PDF and download the result.'],
    faq: [
      { q: 'Can I reverse the page order?', a: 'Yes. Use the Reverse order button to flip the whole document in one click.' },
      { q: 'Can I rotate just one page?', a: 'Yes. Hover over any page and click the rotate icon. Each click turns that page by 90 degrees.' },
      { q: 'Can I undo a change?', a: 'Click Reset to return to the original order and rotation before saving.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'compress-pdf': {
    title: 'Compress PDF online, free, no upload',
    description: 'Reduce PDF file size for email and sharing. Choose light, medium or strong compression. Free, private, and files stay on your device.',
    howToTitle: 'How to compress a PDF',
    howTo: ['Drop one or more PDFs onto the page.', 'Pick a level: Light keeps text selectable, Medium and Strong shrink pages harder.', 'Click Compress and download the smaller file. You’ll see the before and after size.'],
    faq: [
      { q: 'Which level should I choose?', a: 'Light for documents you still want to search or copy text from. Medium for most sharing. Strong when size matters most, such as email attachment limits.' },
      { q: 'Why did my file barely shrink?', a: 'Light compression only repacks the file and removes metadata, so PDFs that are already optimised won’t change much. Try Medium or Strong.' },
      { q: 'Will the text still be selectable?', a: 'With Light, yes. Medium and Strong turn each page into an image to save space, so text can no longer be selected or searched.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'image-to-pdf': {
    title: 'JPG to PDF converter, free and private',
    description: 'Convert JPG, PNG, WebP and other images to PDF, one image per page. Choose page size and margins. Free, instant, no upload.',
    howToTitle: 'How to convert images to PDF',
    howTo: ['Drop your images onto the page. JPG, PNG, WebP, GIF and more are supported.', 'Drag to set the order, then choose a page size, orientation and margin.', 'Click Convert and download your PDF.'],
    faq: [
      { q: 'Can I put several images into one PDF?', a: 'Yes. Every image becomes one page of the same PDF, in the order you arrange them.' },
      { q: 'What does “Fit image” do?', a: 'It makes each page exactly the size of its image, so nothing is cropped or padded. Choose A4 or Letter if you plan to print.' },
      { q: 'Does it work with photos from my phone?', a: 'Yes. HEIC photos need converting to JPG first on most devices, but JPG, PNG and WebP work directly.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'pdf-to-jpg': {
    title: 'PDF to JPG converter, free, no upload',
    description: 'Turn PDF pages into JPG or PNG images at the quality you choose. Convert all pages or just some. Free and private.',
    howToTitle: 'How to convert a PDF to JPG',
    howTo: ['Drop your PDF to see its pages.', 'Pick JPG or PNG and a quality level. Click pages to convert only some of them.', 'Click Convert and download the images, as a ZIP when there’s more than one.'],
    faq: [
      { q: 'JPG or PNG, which should I use?', a: 'JPG gives smaller files and suits photos and scans. PNG is lossless and better for text, diagrams or anything with sharp edges.' },
      { q: 'What resolution are the images?', a: 'Low is 72 DPI (screen size), Medium is 150 DPI (good for sharing) and High is 300 DPI (print quality).' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'rotate-pdf': {
    title: 'Rotate PDF pages online, free',
    description: 'Rotate every page or only selected pages by 90, 180 or 270 degrees and save permanently. Free, instant, nothing uploaded.',
    howToTitle: 'How to rotate a PDF',
    howTo: ['Drop your PDF onto the page.', 'Choose 90°, 180° or 270°. Click individual pages to rotate only those.', 'Click Rotate and download the corrected PDF.'],
    faq: [
      { q: 'Is the rotation permanent?', a: 'Yes. Unlike rotating in a viewer, the saved PDF opens the right way up everywhere.' },
      { q: 'Can I rotate only one page?', a: 'Yes. Click the page (or pages) you want and only those are rotated.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'add-page-numbers': {
    title: 'Add page numbers to a PDF, free online',
    description: 'Insert page numbers into a PDF at the top or bottom, left, centre or right, in formats like “Page 1 of 10”. Free and private.',
    howToTitle: 'How to add page numbers to a PDF',
    howTo: ['Drop your PDF onto the page.', 'Choose the position, format and starting number. The preview updates as you go.', 'Click Add page numbers and download the result.'],
    faq: [
      { q: 'Can I start numbering from a page other than 1?', a: 'Yes. Set “Start at” to any number, for example to continue numbering from a previous document.' },
      { q: 'Which formats are available?', a: '“1”, “Page 1”, “1 / 10” and “Page 1 of 10”.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'add-watermark': {
    title: 'Add a watermark to a PDF, free online',
    description: 'Stamp text like CONFIDENTIAL or DRAFT across every page of a PDF. Set size, angle, opacity and tiling. Free, no upload.',
    howToTitle: 'How to watermark a PDF',
    howTo: ['Drop your PDF onto the page.', 'Type the watermark text and adjust layout, size, angle and opacity using the live preview.', 'Click Add watermark and download the stamped PDF.'],
    faq: [
      { q: 'Can the watermark be removed later?', a: 'It is drawn into each page, so it cannot be switched off by a viewer. Keep an unwatermarked copy if you need one.' },
      { q: 'Can I tile the watermark across the page?', a: 'Yes. Choose Tiled to repeat the text in a diagonal pattern over the whole page.' },
      PRIVACY_FAQ,
      FREE_FAQ,
    ],
  },
  'protect-pdf': {
    title: 'Password protect a PDF, free and private',
    description: 'Add a password to a PDF with AES-256 encryption and control printing, copying and editing. Free, and the password never leaves your device.',
    howToTitle: 'How to password-protect a PDF',
    howTo: ['Drop one or more PDFs onto the page.', 'Enter a password twice and choose whether readers may print, copy or edit.', 'Click Protect and download the encrypted PDF.'],
    faq: [
      { q: 'How strong is the encryption?', a: 'Files are encrypted with AES-256, the strongest option in the PDF standard and the one recommended by ISO 32000-2.' },
      { q: 'What if I forget the password?', a: 'There is no recovery. Keep the password somewhere safe; without it the file cannot be opened.' },
      { q: 'Is my password sent anywhere?', a: 'No. Encryption happens in your browser. Neither the file nor the password leaves your device.' },
      FREE_FAQ,
    ],
  },
  'unlock-pdf': {
    title: 'Remove a password from a PDF, free online',
    description: 'Unlock a PDF you have the password for, or lift printing and copying restrictions. Free, instant, and nothing is uploaded.',
    howToTitle: 'How to unlock a PDF',
    howTo: ['Drop the protected PDF onto the page.', 'Enter its password. Leave it empty if the file only restricts printing or copying.', 'Click Unlock and download a copy that opens without a password.'],
    faq: [
      { q: 'Can it crack a password I don’t know?', a: 'No. It removes protection from files you can already open. It will not guess or break passwords.' },
      { q: 'Is my password sent anywhere?', a: 'No. The file is decrypted in your browser. Neither the PDF nor the password leaves your device.' },
      FREE_FAQ,
    ],
  },
};
