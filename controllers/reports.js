const db = require("../db");
const jwt = require("jsonwebtoken");

const addReport = async (req, res) => {
  try {
    const q = "select * from reports where post_id = ? and user_id = ?";

    const [isReported] = await db.query(q, [req.body.post_id, req.userInfo.id]);

    if (isReported.length)
      return res.status(400).json("The post has already been reported");
    else {
      const reportQuery =
        "insert into reports(`post_id`, `user_id`, `date`, `type`, `other` ) values(?)";

      const values = [
        Number(req.body.post_id),
        req.userInfo.id,
        req.body.date,
        req.body.type,
        req.body.other,
      ];

      const [result] = await db.query(reportQuery, [values]);

      return res.status(200).json("You succesfully reported this entry.");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const addReportComment = async (req, res) => {
  try {
    //check if a report already existing to the comment.
    const q = "select * from reports where comment_id = ? and user_id = ?";

    const [isReported] = await db.query(q, [
      req.body.comment_id,
      req.userInfo.id,
    ]);
    if (isReported.length)
      return res.status(400).json("The comment has already been reported");
    else {
      const reportQuery =
        "insert into reports(`comment_id`, `user_id`, `date`, `type`, `other` ) values(?)";

      const values = [
        Number(req.body.comment_id),
        req.userInfo.id,
        req.body.date,
        req.body.type,
        req.body.other,
      ];

      const [result] = await db.query(reportQuery, [values]);

      return res.status(200).json("You succesfully reported this entry.");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  addReport,
  addReportComment,
};
