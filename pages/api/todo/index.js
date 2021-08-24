import dbConnect from "../../../lib/dbConnect";
import Todo from "../../../models/Todo";

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { search } = req.query;
        let Todos;
        if (search != "") {
          /* find all the data in our database */
          Todos = await Todo.find(
            { $text: { $search: `${req.query.search}` } },
            { score: { $meta: "textScore" } },
            { lean: true }
          ).sort({ score: { $meta: "textScore" } });
        } else {
          Todos = await Todo.find({});
        }
        res.status(200).json({ success: true, data: Todos });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case "POST":
      try {
        const todo = await Todo.create(
          req.body
        ); /* create a new model in the database */
        res.status(201).json({ success: true, data: todo });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
