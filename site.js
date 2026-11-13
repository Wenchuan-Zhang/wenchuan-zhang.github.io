const filters = document.querySelector('.filters');
const buttons = [...filters.querySelectorAll('button')];
const papers = [...document.querySelectorAll('.paper-list > li')];
const results = document.querySelector('#results-count');
filters.hidden = false;
for (const button of buttons) {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
    let count = 0;
    for (const paper of papers) {
      paper.hidden = filter !== 'all' && !paper.dataset.topic.split(' ').includes(filter);
      if (!paper.hidden) count += 1;
    }
    results.textContent = count + ' publications shown.';
  });
}
