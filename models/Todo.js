import mongoose from 'mongoose'

/* TodoSchema will correspond to a collection in your MongoDB database. */
const TodoSchema = new mongoose.Schema({
  title: {
    /* The title of this Todo */
    type: String,
    text : true,
    required: [true, 'Please provide a title for this Todo.'],
    maxlength: [60, 'Title cannot be more than 60 characters'],
    
  },
  completed: {
    /* The status of this Todo */
    type: Boolean,
    default: false
  },
})

export default mongoose.models.Todo || mongoose.model('Todo', TodoSchema)
