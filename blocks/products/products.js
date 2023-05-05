export default function decorate(block) {

    console.log(block);

    let div = document.createElement('div');

    block.querySelectorAll('div > div > div').forEach((d) => {
        const button = document.createElement('button');
        button.innerHTML = d.innerHTML;
        div.appendChild(button);
    });

    block.innerHTML = div.innerHTML;
}
