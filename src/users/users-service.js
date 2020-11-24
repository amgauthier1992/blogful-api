const UsersService = {
  getAllUsers(knex){ //db connection
    return knex.select('*').from('blogful_users')
  },
  insertUser(knex, newUser){ //db connection and newUser object
    return knex
      .insert(newUser)
      .into('blogful_users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id){ //db connection and User Id
    return knex
      .from('blogful_users')
      .select('*')
      .where('id', id) 
      .first() //Sets the column to be inserted on the first position
  },
  deleteUser(knex, id){ //db connection and User Id
    return knex('blogful_users')
      .where({ id }) //where { id: id }
      .delete()
  },
  updateUser(knex, id, newUserFields){ //db connection, User Id, and newUser object
    return knex('blogful_users')
      .where({ id })
      .update(newUserFields)
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
}

module.exports = UsersService;