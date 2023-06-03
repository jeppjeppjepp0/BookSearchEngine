const {AuthenticationError} = require('apollo-server-express');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).populate('thoughts');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        // saveBook: (parent, { input }, context) => {
        //     const { author, description, title, bookId, image, link } = input;
      
        //     const newBook = saveBook(author, description, title, bookId, image, link); 
      
        //     const userId = context.userId;
        //     const user = fetchUserById(userId);
        //     user.books.push(newBook); 
      
        //     return user;
        // },
        removeBook: async (parent, { _id, bookId }, context) => {
            if (context.user) {
                return User.findOneAndUpdate(
                    { _id: _id },
                    {
                        $pull: {
                            comments: {
                                _id: bookId,
                            },
                        },
                    },
                    { new: true }
                );
                }
            throw new AuthenticationError('You need to be logged in!');
        },
    }
}

module.exports = resolvers