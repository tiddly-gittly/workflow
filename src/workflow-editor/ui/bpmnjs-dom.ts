
function createMessageDiv(className: string, children: Element[], isError = false): Element {
  const noteChildren = [...children];

  if (isError) {
    noteChildren.push(
      $tw.utils.domMaker('div', {
        attributes: { class: 'details' },
        children: [
          $tw.utils.domMaker('span', { text: 'cause of the problem' }),
          $tw.utils.domMaker('pre', {}),
        ],
      }),
    );
  }

  return $tw.utils.domMaker('div', {
    attributes: { class: `message ${className}` },
    children: [
      $tw.utils.domMaker('div', { attributes: { class: 'note' }, children: noteChildren }),
    ],
  });
}

function createLinkListItem(id: string, text: string, title: string): Element {
  return $tw.utils.domMaker('li', {
    children: [
      $tw.utils.domMaker('a', {
        attributes: { id, href: '#', title },
        text,
      }),
    ],
  });
}

export function bpmnjsDom() {
  // Create the 'content' div with its children
  const contentDiv = $tw.utils.domMaker('div', {
    attributes: {
      class: 'content',
      id: 'js-drop-zone',
    },
    children: [
      createMessageDiv('intro', [
        $tw.utils.domMaker('span', { text: 'Drop BPMN diagram from your desktop or ' }),
        $tw.utils.domMaker('a', { attributes: { id: 'js-create-diagram', href: '#' }, text: 'create a new diagram' }),
        $tw.utils.domMaker('span', { text: ' to get started.' }),
      ]),
      createMessageDiv('error', [
        $tw.utils.domMaker('span', { text: 'Ooops, we could not display the BPMN 2.0 diagram.' }),
      ], true),
      $tw.utils.domMaker('div', { attributes: { class: 'canvas', id: 'js-canvas' } }),
    ],
  });

  // Create the 'buttons' ul with its children
  const buttonsUl = $tw.utils.domMaker('ul', {
    attributes: { class: 'buttons' },
    children: [
      $tw.utils.domMaker('li', { text: 'download' }),
      createLinkListItem('js-download-diagram', 'BPMN diagram', 'download BPMN diagram'),
      createLinkListItem('js-download-svg', 'SVG image', 'download as SVG image'),
    ],
  });

  return {
    contentDiv,
    buttonsUl,
  };
}
