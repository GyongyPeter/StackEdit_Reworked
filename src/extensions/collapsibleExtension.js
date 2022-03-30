import extensionSvc from '../services/extensionSvc';

extensionSvc.onSectionPreview((elt, options, isEditor) => {

    const regExpForCollapsible = new RegExp('^/{[\\s\\S]*}/$', 'gm');
    elt.querySelectorAll('*').cl_each((spanElt_) => {
        const innerHtml = spanElt_.innerHTML;

        const innerText = spanElt_.innerText;
        const match2 = innerText.match(regExpForCollapsible);

        if (match2) {
            const collapsibleButton = document.createElement('button');
            collapsibleButton.className = 'collapsible-button';
            const buttonString = innerText.match(new RegExp('(?<=/{)[\\S ]*\\n'));
            collapsibleButton.textContent = buttonString;
            spanElt_.parentNode.replaceChild(collapsibleButton, spanElt_);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'collapsible-content';
            let contentHtml = innerHtml.match(new RegExp('(?<=/{[\\S ]*\\n)[\\s\\S]*'))[0];
            contentHtml = contentHtml.slice(0, -1);
            contentHtml = contentHtml.slice(0, -1);

            contentDiv.innerHTML = contentHtml;

            collapsibleButton.after(contentDiv);
        }
    });

});
