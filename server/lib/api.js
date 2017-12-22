module.exports = {

  getEverything: () => {
    return global.knex
      .select()
      .from('polls')
  },

  createPoll: (input) => {
    return global.knex
      .insert({
        creator: input.creator,
        poll_title: input.title,
        admin_url: "/adminurl1",
        poll_url: "/pollurl#1",
        is_open: false,
        created_date: "12/12/14"
      })
      .into('polls')
      .returning('id')
      .then(function(id) {
        pollInsert(id,input);
      });
  }


  // TODO: Add error throwing if initial post creation fails so that step 2 isn't taken

}

function pollInsert (id, input){
  Promise.all(input.item.map((item) =>{
    return global.knex
      .insert({
        poll_item: item,
        description: 'item_description#zzz',
        rank: 0,
        poll_id: id[0]
      })
      .into('poll_items')
  }));
}