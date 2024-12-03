
document.getElementById('saveTags').addEventListener('click', () => {
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
  const action = document.getElementById('action').value;
  chrome.storage.sync.set({ tags, action }, () => {
    console.log('Tags and action saved');
  });
});