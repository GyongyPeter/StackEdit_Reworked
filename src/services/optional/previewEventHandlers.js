import editorSvc from '../editorSvc';
import store from '../../store';

const regExpTask = /^([ \t]*(?:[*+-]|\d+\.)[ \t]+\[)[ xX](\] .*)/;
const regExpThreeStateCheckbox = new RegExp('^(.?[ \\t]|.+[ \\t]|)([€]+[ 123])([\\s\\S]*)$');

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

    if (evt.target.nodeName === 'LI') {
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

      const eventUpload = new CustomEvent('handleWhenDragDropped', {
        detail: {
          fileName: file.fileName,
          url: file.url,
          randomFile: Math.floor(Math.random() * 5),
          fileSize: file.size
        }
      });

      window.dispatchEvent(eventUpload);

      window.addEventListener('handleWhenUploadIsInProgress', (eInProgress) => {
        const totalBytes = eInProgress.detail.totalBytes;
        let uploadedBytes = eInProgress.detail.uploadedBytes;
        const isFailed = eInProgress.detail.isFailed;
  
        if (totalBytes == uploadedBytes) {
          const fileName = eInProgress.detail.fileName;
          const url = eInProgress.detail.url;
          if (store.getters['content/isCurrentEditable']) {
            const editorContent = editorSvc.clEditor.getContent();
            // Use setTimeout to ensure e.target.checked has the old value
            setTimeout(() => {
              dropZoneElement.classList.remove('drag-drop');
              dropZoneElement.classList.add('drag-drop__filled');
              // Make sure content has not changed
              if (editorContent === editorSvc.clEditor.getContent()) {
                const previewOffset = getPreviewOffset(dropZoneElement);
                const endOffset = editorSvc.getEditorOffset(previewOffset + 1);
                if (endOffset != null) {
                  const startOffset = editorContent.lastIndexOf('\n', endOffset - 10) + 1;
                  const line = editorContent.slice(startOffset, e.target.textContent.length + endOffset);
                  const match = line.match(`^((.|\n)?|(.|\n)+|)(\\$dd)(([ \t]\\[)(.+|.?)(\\]))((.|\n)?|(.|\n)+)$`);
                  if (match) {
                    let newContent = editorContent.slice(0, startOffset);
                    newContent += match[1];
                    newContent += match[4];
                    newContent += match[6];
                    if (fileName) {
                      newContent += fileName;
                    }
                    newContent += match[8] + match[9];
                    newContent += editorContent.slice(endOffset);

                    editorSvc.clEditor.setContent(newContent, true);

                    if (url && (url.includes('jpg') || url.includes('jpeg') || url.includes('png') || url.includes('gif'))) {
                      const img = document.createElement('img');
                      img.src = url;

                      const scale = 300 / img.height;
                      dropZoneElement.style.width = `${img.width * scale}px`;
                      dropZoneElement.style.height = `300px`;

                      img.style.width = `${img.width * scale}px`;
                      img.style.height = `300px`;

                      dropZoneElement.appendChild(img);
                      e.target.parentNode.replaceChild(img, e.target);
                    } else if (url) {
                      const a = document.createElement('a');
                      a.text = fileName;
                      a.href = url;
                      dropZoneElement.appendChild(a);
                    }
                  }
                }
              }
            }, 10);
          }
        } else {
          let divBorderElement;
          if (dropZoneElement.children[1] && dropZoneElement.children[1].classList.contains('in-progress-border')) {
            divBorderElement = dropZoneElement.children[1];
          } else {
            divBorderElement = document.createElement('div');
            divBorderElement.className = 'in-progress-border';
            dropZoneElement.appendChild(divBorderElement);
          }
          const divBarElement = document.createElement('div');
          divBarElement.className = 'in-progress-bar';
          
          const uploadedRate = uploadedBytes / totalBytes;
          divBarElement.style.width = uploadedRate * 300 + "px";
          divBarElement.innerHTML = Math.floor(uploadedRate * 300 / 3) + "%";
          
          dropZoneElement.classList.remove('drag-drop');
          dropZoneElement.classList.add('drag-drop__filled');
          dropZoneElement.children[0].placeholder = '';
          if (divBorderElement.lastChild) {
            divBorderElement.removeChild(divBorderElement.lastChild);
          }
          divBorderElement.appendChild(divBarElement);
        }
      });
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
            debugger
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

  const handleThreeStateCheckboxContent = function (evt, editorContent, startOffset, endOffset, match) {
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