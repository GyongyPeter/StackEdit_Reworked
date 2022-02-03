import editorSvc from '../editorSvc';
import store from '../../store';

const regExpTask = /^([ \t]*(?:[*+-]|\d+\.)[ \t]+\[)[ xX](\] .*)/;
const regExpThreeStateCheckbox = /^(.?[ \t]|.+[ \t]|)([€]+[ 123])(([ \t])(.+)|[ \t]|)/;

editorSvc.$on('inited', () => {
  const getPreviewOffset = (elt) => {
    let offset = 0;
    if (!elt || elt === editorSvc.previewElt) {
      return offset;
    }
    let { previousSibling } = elt;
    while (previousSibling) {
      offset += previousSibling.textContent.length;
      ({ previousSibling } = previousSibling);
    }
    return offset + getPreviewOffset(elt.parentNode);
  };

  editorSvc.previewElt.addEventListener('click', (evt) => {
    if (evt.target.classList.contains('task-list-item-checkbox')) {
      handleClickEvent(evt, regExpTask, handleTaskContent);
    }

    if (evt.target.classList.contains('threeStateCheckbox')) {
      handleClickEvent(evt, regExpThreeStateCheckbox, handleThreeStateCheckboxContent);
    }
  });

  editorSvc.previewElt.addEventListener('mouseover', (evt) => {
    if (evt.target.classList.contains('threeStateCheckbox')) {
      evt.target.style.cursor = 'pointer';
    }
  });

  editorSvc.previewElt.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.target.classList.contains('drag-drop__input')) {
      const dropZoneElement = e.target.parentNode;
      const file = e.dataTransfer.files[0];
      // console.log(file);
      // console.log(dropZoneElement);
      // let thumbnailElement = document.createElement("div");
      // thumbnailElement.classList.add("drag-drop__thumb");
      // thumbnailElement.classList.add("drag-drop__input");
      
      const img_ = document.createElement('img');
      dropZoneElement.appendChild(img_);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = () => {
          dropZoneElement.classList.remove('drag-drop');
          dropZoneElement.classList.add('drag-drop__filled');
          e.target.parentNode.replaceChild(img_, e.target);

          let img = new Image();
          img.src = reader.result;
          // thumbnailElement.style.background = `url('${reader.result}') no-repeat`;
          // thumbnailElement.style.backgroundSize = 'cover';

          const scale = 300 / img.height;
          // thumbnailElement.style.width = `${img.width * scale}px`;
          // thumbnailElement.style.height = `300px`;

          dropZoneElement.style.width = `${img.width * scale}px`;
          dropZoneElement.style.height = `300px`;

          //img_.classList.add("drag-drop__thumb");
          img_.src = reader.result;

          img_.style.width = `${img.width * scale}px`;
          img_.style.height = `300px`;
          img_style.float = 'left';

          dropZoneElement.appendChild(img_);
        };
      } else {
        // thumbnailElement.style.backgroundImage = null;
      }

      // editorSvc.clEditor.setContent(editorSvc.clEditor.getContent() + ' ASD', true);
    }
  });

  const handleClickEvent = function (evt, regExp, functionReference) {
    evt.preventDefault();
    if (store.getters['content/isCurrentEditable']) {
      const editorContent = editorSvc.clEditor.getContent();
      // Use setTimeout to ensure evt.target.checked has the old value
      setTimeout(() => {
        // Make sure content has not changed
        if (editorContent === editorSvc.clEditor.getContent()) {
          const previewOffset = getPreviewOffset(evt.target);
          const endOffset = editorSvc.getEditorOffset(previewOffset + 1);
          if (endOffset != null) {
            const startOffset = editorContent.lastIndexOf('\n', endOffset) + 1;
            const line = editorContent.slice(startOffset, evt.target.textContent.length + endOffset);
            const match = line.match(regExp);
            if (match) {
              functionReference(evt, editorContent, startOffset, evt.target.textContent.length + endOffset, match);
            }
          }
        }
      }, 10);
    }
  };

  const handleTaskContent = function (evt, editorContent, startOffset, endOffset, match) {
    let newContent = editorContent.slice(0, startOffset);
    newContent += match[1];
    newContent += evt.target.checked ? ' ' : 'x';
    newContent += match[2];
    
    newContent += editorContent.slice(endOffset);
    editorSvc.clEditor.setContent(newContent, true);
  }

  const handleThreeStateCheckboxContent = function(evt, editorContent, startOffset, endOffset, match) {
    let newContent = editorContent.slice(0, startOffset);
    newContent += match[1];
    
    if (match[2].includes('€€€1')) {
      newContent += '€€€2';
    } else
    if (match[2].includes('€€€2')) {
      newContent += '€€€3';
    } else
    if (match[2].includes('€€€3')) {
      newContent += '€€€1';
    }

    newContent += match[3];
    
    newContent += editorContent.slice(endOffset);
    editorSvc.clEditor.setContent(newContent, true);
  }
});
