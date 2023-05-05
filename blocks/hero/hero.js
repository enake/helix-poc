
function findH1s(node) {
    if (node.tagName === 'H1') {
        console.log(node);
    } else {
        for (let i = 0; i < node.childNodes.length; i++) {
            findH1s(node.childNodes[i]);
        } 
    }
}


export default function decorate(block) {
    console.log(block);

    [...block.children].forEach((row) => {
        console.log(row);
    });

    //findH1s(block.children);
}
