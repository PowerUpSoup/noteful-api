function makeNotesArray() {
  return [
    {
      id: 1,
      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      date_created: '2029-01-22T16:28:32.615Z',
      folder_id: 1,
    },
    {
      id: 2,
      folder_id: 1,
      date_created: '2100-05-22T16:28:32.615Z',
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
    },
    {
      id: 3,
      folder_id: 2,
      date_created: '1919-12-22T16:28:32.615Z',
      text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus, voluptate? Necessitatibus, reiciendis? Cupiditate totam laborum esse animi ratione ipsa dignissimos laboriosam eos similique cumque. Est nostrum esse porro id quaerat.'
    },
    {
      id: 4,
      folder_id: 3,
      date_created: '1919-12-22T16:28:32.615Z',
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum molestiae accusamus veniam consectetur tempora, corporis obcaecati ad nisi asperiores tenetur, autem magnam. Iste, architecto obcaecati tenetur quidem voluptatum ipsa quam?'
    },
  ];
}

module.exports = {
  makeNotesArray
}
