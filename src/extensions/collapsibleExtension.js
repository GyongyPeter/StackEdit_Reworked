import extensionSvc from '../services/extensionSvc';

extensionSvc.onSectionPreview((elt, options, isEditor) => {

    const regExpStartForCollapsible = new RegExp('[\\s\\S]*/{[\\s\\S]*', 'gm');
    const regExpEndForCollapsible = new RegExp('[\\s\\S]*}/[\\s\\S]*$', 'gm');

    elt.querySelectorAll('*').cl_each((spanElt_) => {

        const clPreviewSectionOuterHTML = spanElt_.parentNode.outerHTML;
        const clPreviewSectionInnerHTML = spanElt_.parentNode.innerHTML;
        if (clPreviewSectionOuterHTML.includes('class="cl-preview-section"')) {
            
            const matchStart = clPreviewSectionInnerHTML.match(regExpStartForCollapsible);
            if (matchStart) {
                const matchEnd = clPreviewSectionInnerHTML.match(regExpEndForCollapsible);
                if (matchEnd) {
                    const clPreviewSectionInnerText = spanElt_.parentNode.innerText;
                    if (!spanElt_.parentNode.innerHTML.includes('class="collapsible-content"')) {

                        const collapsibleButton = document.createElement('button');
                        collapsibleButton.className = 'collapsible-button';
                        const buttonString = clPreviewSectionInnerText.match(new RegExp('(?<=/{)[\\S ]*\\n'))[0].slice(0, -1);
                        collapsibleButton.textContent = buttonString;
                        spanElt_.parentNode.replaceChild(collapsibleButton, spanElt_);

                        const contentDiv = document.createElement('div');
                        contentDiv.className = 'collapsible-content';

                        collapsibleButton.after(contentDiv);

                        let finalString = clPreviewSectionInnerHTML.replace(new RegExp(`/{${buttonString}<br>`), "");
                        finalString = finalString.replace('}/', "");



                        // Handle Youtube
                        if (clPreviewSectionInnerHTML.match(new RegExp(`^({(YT|yt)}:)[ \t]\\((.*)(youtube.com)(.*)\\)`, 'm'))) {
                            const youtubeStringHtml = clPreviewSectionInnerHTML.match(new RegExp(`^({(YT|yt)}:)[ \t]\\((.*)(youtube.com)(.*)\\)`, 'm'))[0];
                            let youtubeStringText = clPreviewSectionInnerText.match(new RegExp(`^({(YT|yt)}:)[ \t]\\((.*)(youtube.com)(.*)\\)`, 'm'))[0];

                            youtubeStringText = youtubeStringText.replace(new RegExp('^({(YT|yt)}:)[ \t]\\('), "");
                            youtubeStringText = youtubeStringText.replace(')', "");

                            const iFrame = document.createElement('iframe');
                            iFrame.className = 'yt-embed';

                            iFrame.width = '560px';
                            iFrame.height = '360px';
                            iFrame.allowFullscreen = true;
                            iFrame.frameborder = 0;

                            const ytWatchString = '/watch?v=';
                            if (youtubeStringText.includes(ytWatchString)) {
                                youtubeStringText = youtubeStringText.replace(ytWatchString, '/embed/');
                            }

                            iFrame.src = youtubeStringText;

                            finalString = finalString.replace(youtubeStringHtml, iFrame.outerHTML);
                        }

                        contentDiv.innerHTML = finalString;
                    } else {
                        spanElt_.remove();
                    }

                }
            } else if (clPreviewSectionInnerHTML.includes('class="collapsible-content"')) {
                spanElt_.remove();
            }
        }
    });
});
