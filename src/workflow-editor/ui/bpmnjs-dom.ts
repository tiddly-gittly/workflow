
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

export function bpmnjsDom({ width, height }: { height?: string; width?: string }): HTMLDivElement {
  // Create the 'content' div with its children
  const contentDiv = $tw.utils.domMaker('div', {
    attributes: {
      class: 'content',
      id: 'js-drop-zone',
      style: `height: ${height ?? '"unset"'}; width: ${width ?? '"unset"'};`,
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

  return contentDiv;
}
