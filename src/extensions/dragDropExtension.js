import extensionSvc from '../services/extensionSvc';

extensionSvc.onSectionPreview((elt, options, isEditor) => {

    const regExpForDragDrop = /^([\s\S]*)\$dd[ \t]\[([\s\S]*)\]([\s\S]*)$/;
    elt.querySelectorAll('p').cl_each((spanElt_) => {
        const innerText = spanElt_.innerText;
        const match2 = innerText.match(regExpForDragDrop);

        if (match2) {
            const dropZone = document.createElement('div');
            spanElt_.parentNode.replaceChild(dropZone, spanElt_);

            if (match2[2] != '' && !match2[2].match(/^\s*$/)) {
                // Delete /n character from start and end if exist
                if (match2[2][0] == '\n') {
                    match2[2] = match2[2].substring(1);
                }

                if (match2[2][match2[2].length - 1] == '\n') {
                    match2[2] = match2[2].substring(0, match2[2].length - 1);
                }
                const fileName = match2[2];

                // TODO: check if fileName exists on server
                const fileIsExists = true;

                if (!dropZone.classList.contains('drag-drop__filled')) {
                    let htmlElement;
                    if (fileIsExists) {
                        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.apng', '.avif', '.jtif', '.pjpeg', '.pjp', '.svg', '.webp', '.bmp', '.ico', '.cur', '.tif', '.tiff'];
                        if (fileName && fileName.includes(...imageExtensions)) {
                            htmlElement = document.createElement('img');
                            htmlElement.src = 'http://2.tcp.ngrok.io:18628/' + fileName;
                            //htmlElement.src = "https://cdn.nwmgroups.hu/s/img/i/1408/20140807foto-szelfie-makako-majom-fenykep.jpg?w=800&h=1106&t=5";
                            
                            const figCaption = document.createElement('figcaption');
                            figCaption.textContent = fileName;
                            figCaption.style.backgroundColor = '#222222';
                            figCaption.style.color = '#ffffff';
                            figCaption.style.padding = '3px';
                            figCaption.style.margin = '0px';
                            figCaption.style.textAlign = 'center';
                            figCaption.style.font = 'italic smaller sans-serif';

                            const img = new Image();
                            img.src = htmlElement.src;
                            //img.src = "https://cdn.nwmgroups.hu/s/img/i/1408/20140807foto-szelfie-makako-majom-fenykep.jpg?w=800&h=1106&t=5";
                            img.onload = function () {
                                htmlElement.style.height = `300px`;
                                const scale = 300 / this.height;
                                dropZone.style.width = Math.ceil(this.width * scale) + 'px';
                                figCaption.style.width = Math.ceil(this.width * scale) + 'px';
                            };


                            if (dropZone.lastChild) {
                                dropZone.replaceChild(htmlElement, dropZone.lastChild);
                            } else {
                                dropZone.appendChild(htmlElement);
                            }

                            //dropZone.appendChild(figCaption);
                        } else if (fileName) {
                            htmlElement = document.createElement('a');
                            htmlElement.text = fileName;
                            htmlElement.href = 'http://2.tcp.ngrok.io:18628/' + fileName;

                            if (dropZone.lastChild) {
                                dropZone.replaceChild(htmlElement, dropZone.lastChild);
                            } else {
                                dropZone.appendChild(htmlElement);
                            }
                        }
                    }
                    else {
                        htmlElement = document.createElement('p');
                        htmlElement.textContent = `'${fileName}' is not exists!`;
                        htmlElement.style.color = 'red';

                        if (dropZone.lastChild) {
                            dropZone.replaceChild(htmlElement, dropZone.lastChild);
                        } else {
                            dropZone.appendChild(htmlElement);
                        }
                    }
                }

                dropZone.className = 'drag-drop__filled';
            } else {
                dropZone.className = 'drag-drop';
                const input = document.createElement('input');
                input.className = 'drag-drop__input';
                input.placeholder = 'Drag & drop a file!';
                dropZone.appendChild(input);
            }

            // InnerHtml needs to store the STYLED (<p>) content before and after the drag & drop content. 
            const match = spanElt_.innerHTML.match(regExpForDragDrop);
            const pBefore = document.createElement('p');
            const pAfter = document.createElement('p');
            
            pBefore.innerHTML = match[1];
            pAfter.innerHTML  = match[3];

            dropZone.parentNode.insertBefore(pBefore, dropZone);
            dropZone.parentNode.appendChild(pAfter);
        }
    });
});
