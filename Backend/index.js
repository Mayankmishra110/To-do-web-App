const express = require("express");

const { createTodo } = require("/types");

const app = express();

app.use(express.json());

app.post("/todo", async function (req, res) {
  const createPayload = req.body;
  const parsePayload = createTodo.safeParse(createPayload);

  if (!parsePayload.sucess) {
    res.status(411).json({
      msg: "you sent the wrong inputs",
    });
    return;
  }
  await todo.create({
    title: createPayload.title,
    description: createdPayload.description,
  });

  res.json({
    msg: "Todo created",
  });
});

app.get("/todos", async function (req, res) {
  const todos = await todo.find({});
  // console.log(todos)
  res.json({
    todos,
  });
});

app.put("/completed", function (req, res) {
  const updatePayload = req.body;
  const parsePayload = update.safeParse(updatePayload);
  if (!parsePayload.sucess) {
    res.status(411).json({
      msg: "You sent me wrong inputs",
    });
    return;
  }
});
