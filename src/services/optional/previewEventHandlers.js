import editorSvc from '../editorSvc';
import store from '../../store';

const regExpTask = /^([ \t]*(?:[*+-]|\d+\.)[ \t]+\[)[ xX](\] .*)/;
const regExpThreeStateCheckbox = new RegExp('^(.?[ \\t]|.+[ \\t]|)([€]+[ 123])([\\s\\S]*)$');
const regExpForCollapsible = new RegExp('/{[\\s\\S]*}/');

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

    if (evt.target.nodeName === 'LI' || evt.target.nodeName === 'P') {
      handleClickEvent(evt, regExpThreeStateCheckbox, handleThreeStateCheckboxContent);
    }

    if (evt.target.classList.contains('collapsible-button')) {
      evt.preventDefault();
      //if (store.getters['content/isCurrentEditable']) {
        const editorContent = editorSvc.clEditor.getContent();
        // Use setTimeout to ensure evt.target.checked has the old value
        setTimeout(() => {
          // Make sure content has not changed
          if (editorContent === editorSvc.clEditor.getContent()) {
            const content_ = evt.target.nextSibling;
            const previewOffset = getPreviewOffset(evt.target);
            const endOffset = editorSvc.getEditorOffset(previewOffset + 1);
            if (endOffset != null) {
              const startOffset = editorContent.lastIndexOf('\n', endOffset);
              const end = editorContent.indexOf('}/', startOffset + 1);
              const line = editorContent.slice(startOffset, end + 2);
              const match = line.match(regExpForCollapsible);
              if (match) {
                evt.target.classList.toggle("active");
                var content = evt.target.nextElementSibling;
                if (content.style.display === "block") {
                  content.style.display = "none";
                } else {
                  content.style.display = "block";
                }
            }
          }
        }
        }, 10);
      //}
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
      const fileName = file.name;

      // Progress bar contains divBorderElement and divBarElement.
      let divBorderElement;
      const divBarElement = document.createElement('div');

      const url = 'ws://2.tcp.ngrok.io:18628/ul/'
      const ws = new WebSocket(url);

      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        ws.send(`${file.size}|${file.name}`);
        var fr = new FileReader();
        fr.addEventListener("loadend", function () {
          ws.send(fr.result);
        });

        if (dropZoneElement.children[1] && dropZoneElement.children[1].classList.contains('in-progress-border')) {
          divBorderElement = dropZoneElement.children[1];
        } else {
          divBorderElement = document.createElement('div');
          divBorderElement.className = 'in-progress-border';
          dropZoneElement.appendChild(divBorderElement);
        }
        
        divBarElement.className = 'in-progress-bar';
        divBarElement.style.width = "1px";
        divBarElement.innerHTML = "0%";
        
        dropZoneElement.classList.remove('drag-drop');
        dropZoneElement.classList.add('drag-drop__filled');
        dropZoneElement.children[0].placeholder = '';
        if (divBorderElement.lastChild) {
          divBorderElement.removeChild(divBorderElement.lastChild);
        }
        divBorderElement.appendChild(divBarElement);

        fr.readAsArrayBuffer(file);
      };

      // Receiving chunks
      ws.onmessage = function (evt) {

        const receivingByteMessage = evt.data;
        const receivedBytes = receivingByteMessage.split(':')[1];

        if (!Number(receivedBytes)) {
          return;
        }

        const uploadedRate = receivedBytes / file.size;
        divBarElement.style.width = uploadedRate * 300 + "px";
        divBarElement.innerHTML = Math.floor(uploadedRate * 300 / 3) + "%";
      };

      ws.onclose = function () {
        console.log("Connection is closed...");

        divBarElement.style.width = "300px";
        divBarElement.innerHTML = "100%";
        
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
                  newContent += fileName;
                  newContent += match[8] + match[9];
                  newContent += editorContent.slice(endOffset);

                  editorSvc.clEditor.setContent(newContent, true);

                  // if (fileName && (fileName.includes('jpg') || fileName.includes('jpeg') || fileName.includes('png') || fileName.includes('gif'))) {
                  //   const img = document.createElement('img');
                  //   img.src = 'http://2.tcp.ngrok.io:18628' + fileName;

                  //   const scale = 300 / img.height;
                  //   dropZoneElement.style.width = `${img.width * scale}px`;
                  //   dropZoneElement.style.height = `300px`;

                  //   img.style.width = `${img.width * scale}px`;
                  //   img.style.height = `300px`;

                  //   dropZoneElement.appendChild(img);
                  //   e.target.parentNode.replaceChild(img, e.target);
                  // } else if (fileName) {
                  //   const a = document.createElement('a');
                  //   a.text = fileName;
                  //   a.href = 'http://2.tcp.ngrok.io:18628' + fileName;
                  //   dropZoneElement.appendChild(a);
                  // }
                }
              }
            }
          }, 10);
        }
      };

      ws.onerror = function (e) {
        console.error(e);
      }
    }
  });

  const handleClickEvent = function (evt, regExp, functionReference) {
    evt.preventDefault();
    //if (store.getters['content/isCurrentEditable']) {
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
    //}
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