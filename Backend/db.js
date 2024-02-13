const mongoose = require("mongoose");

//  mongodb+srv://kirags123:8qPEa8KTKBEh2bss@cluster0.f3qlbuo.mongodb.net/todos

mongoose.connect(
  "mongodb+srv://kirags123:8qPEa8KTKBEh2bss@cluster0.f3qlbuo.mongodb.net/todos"
);
const totSchema = mongoose.Schema({
  title: String,
  description: String,
  Completed: Boolean,
});

const todo = mongoose.model("todos", todoSchema);

module.exports = {
  todo,
};
