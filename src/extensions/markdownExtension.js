import Prism from 'prismjs';
import markdownitAbbr from 'markdown-it-abbr';
import markdownitDeflist from 'markdown-it-deflist';
import markdownitFootnote from 'markdown-it-footnote';
import markdownitMark from 'markdown-it-mark';
import markdownitImgsize from 'markdown-it-imsize';
import markdownitSub from 'markdown-it-sub';
import markdownitSup from 'markdown-it-sup';
import markdownitTasklist from './libs/markdownItTasklist';
import markdownItThreeStateCheckbox from './libs/markdownItThreeStateCheckbox';
import markdownitAnchor from './libs/markdownItAnchor';
import extensionSvc from '../services/extensionSvc';
import markdownItDragDrop from './libs/markdownItDragDrop';
import markdownItYoutubeEmbed from './libs/markdownItYoutubeEmbed';
import markdownCollapsible from './libs/markdownCollapsible';

const coreBaseRules = [
  'normalize',
  'block',
  'inline',
  'linkify',
  'replacements',
  'smartquotes',
];
const blockBaseRules = [
  'code',
  'fence',
  'blockquote',
  'hr',
  'list',
  'reference',
  'heading',
  'lheading',
  'html_block',
  'table',
  'paragraph',
];
const inlineBaseRules = [
  'text',
  'newline',
  'escape',
  'backticks',
  'strikethrough',
  'emphasis',
  'link',
  'image',
  'autolink',
  'html_inline',
  'entity',
];
const inlineBaseRules2 = [
  'balance_pairs',
  'strikethrough',
  'emphasis',
  'text_collapse',
];

extensionSvc.onGetOptions((options, properties) => Object
  .assign(options, properties.extensions.markdown));

extensionSvc.onInitConverter(0, (markdown, options) => {
  markdown.set({
    html: true,
    breaks: !!options.breaks,
    linkify: !!options.linkify,
    typographer: !!options.typographer,
    langPrefix: 'prism language-',
  });

  markdown.core.ruler.enable(coreBaseRules);

  const blockRules = blockBaseRules.slice();
  if (!options.fence) {
    blockRules.splice(blockRules.indexOf('fence'), 1);
  }
  if (!options.table) {
    blockRules.splice(blockRules.indexOf('table'), 1);
  }
  markdown.block.ruler.enable(blockRules);

  const inlineRules = inlineBaseRules.slice();
  const inlineRules2 = inlineBaseRules2.slice();
  if (!options.del) {
    inlineRules.splice(blockRules.indexOf('strikethrough'), 1);
    inlineRules2.splice(blockRules.indexOf('strikethrough'), 1);
  }
  markdown.inline.ruler.enable(inlineRules);
  markdown.inline.ruler2.enable(inlineRules2);

  if (options.abbr) {
    markdown.use(markdownitAbbr);
  }
  if (options.deflist) {
    markdown.use(markdownitDeflist);
  }
  if (options.footnote) {
    markdown.use(markdownitFootnote);
  }
  if (options.imgsize) {
    markdown.use(markdownitImgsize);
  }
  if (options.mark) {
    markdown.use(markdownitMark);
  }
  if (options.sub) {
    markdown.use(markdownitSub);
  }
  if (options.sup) {
    markdown.use(markdownitSup);
  }
  if (options.tasklist) {
    markdown.use(markdownitTasklist);
  }
  if (options.threeStateCheckbox) {
    markdown.use(markdownItThreeStateCheckbox);
  }
  if (options.dragDrop) {
    markdown.use(markdownItDragDrop);
  }
  if (options.embedYt) {
    markdown.use(markdownItYoutubeEmbed);
  }
  if (options.collapsible) {
    markdown.use(markdownCollapsible);
  }
  markdown.use(markdownitAnchor);

  // Wrap tables into a div for scrolling
  markdown.renderer.rules.table_open = (tokens, idx, opts) =>
    `<div class="table-wrapper">${markdown.renderer.renderToken(tokens, idx, opts)}`;
  markdown.renderer.rules.table_close = (tokens, idx, opts) =>
    `${markdown.renderer.renderToken(tokens, idx, opts)}</div>`;

  // Transform style into align attribute to pass the HTML sanitizer
  const textAlignLength = 'text-align:'.length;
  markdown.renderer.rules.td_open = (tokens, idx, opts) => {
    const token = tokens[idx];
    if (token.attrs && token.attrs.length && token.attrs[0][0] === 'style') {
      token.attrs = [
        ['align', token.attrs[0][1].slice(textAlignLength)],
      ];
    }
    return markdown.renderer.renderToken(tokens, idx, opts);
  };
  markdown.renderer.rules.th_open = markdown.renderer.rules.td_open;

  markdown.renderer.rules.footnote_ref = (tokens, idx) => {
    const n = `${Number(tokens[idx].meta.id + 1)}`;
    let id = `fnref${n}`;
    if (tokens[idx].meta.subId > 0) {
      id += `:${tokens[idx].meta.subId}`;
    }
    return `<sup class="footnote-ref"><a href="#fn${n}" id="${id}">${n}</a></sup>`;
  };
});

extensionSvc.onSectionPreview((elt, options, isEditor) => {
  // Highlight with Prism
  elt.querySelectorAll('.prism').cl_each((prismElt) => {
    if (!prismElt.$highlightedWithPrism) {
      Prism.highlightElement(prismElt);
      prismElt.$highlightedWithPrism = true;
    }
  });

  // Transform task spans into checkboxes
  elt.querySelectorAll('span.task-list-item-checkbox').cl_each((spanElt) => {
    const checkboxElt = document.createElement('input');
    checkboxElt.type = 'checkbox';
    checkboxElt.className = 'task-list-item-checkbox';
    if (spanElt.classList.contains('checked')) {
      checkboxElt.setAttribute('checked', true);
    }
    if (!isEditor) {
      checkboxElt.disabled = 'disabled';
    }
    spanElt.parentNode.replaceChild(checkboxElt, spanElt);
  });

  // elt.querySelectorAll('threeStateCheckbox').cl_each((spanElt_) => {
  //   debugger
  //   const button = document.createElement('button');
  //   button.className = 'threeStateCheckbox';
  //   button.textContent = spanElt_.parentNode.textContent;
  //   button.style.border = '0';

  //   spanElt_.parentNode.replaceChild(button, spanElt_);
  // });

  elt.querySelectorAll('p').cl_each((spanElt_) => {
    const innerText = spanElt_.innerText;
    const innerHtml = spanElt_.innerHTML;
    const matchHTML = innerHtml.match(new RegExp(`^([\\s\\S]*)({(YT|yt)}:)[ \t]\\((.*)(youtube.com)(.*)\\)([\\s\\S]*)$`, 'm'));
    const matchText = innerText.match(new RegExp(`^([\\s\\S]*)({(YT|yt)}:)[ \t]\\((.*)(youtube.com)(.*)\\)([\\s\\S]*)$`, 'm'));

    if (matchHTML && matchText) {
      const iFrame = document.createElement('iframe');
      iFrame.className = 'yt-embed';
      spanElt_.parentNode.replaceChild(iFrame, spanElt_);

      if ((matchHTML[1] || matchHTML[1] === '') && (matchHTML[7] || matchHTML[7] === '')) {
        const pBefore = document.createElement('p');
        pBefore.innerHTML = matchHTML[1];

        const pAfter = document.createElement('p');
        pAfter.innerHTML = matchHTML[7];

        iFrame.parentNode.insertBefore(pBefore, iFrame);
        iFrame.parentNode.appendChild(pAfter);
      }

      iFrame.width = '560px';
      iFrame.height = '360px';
      iFrame.allowFullscreen = true;
      iFrame.frameborder = 0;

      const ytWatchString = '/watch?v=';
      if (matchText[6].includes(ytWatchString)) {
        const index = matchText[6].indexOf(ytWatchString);
        matchText[6] = matchText[6].slice(index + ytWatchString.length);
      }
      iFrame.src = matchText[4] + matchText[5] + '/embed/' + matchText[6];
    }
  });
});
