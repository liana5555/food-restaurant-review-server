const db = require("../db");
const jwt = require("jsonwebtoken");

const getComments = async (req, res) => {
  try {
    if (parseInt(req.query.low) === 0) {
      const q =
        "select max(idcomments) as highest_id from comments where post_id = ?";

      const [mostRecent] = await db.query(q, [req.params.postid]);

      const highest = mostRecent[0].highest_id;

      const q2 = `
            SELECT 
                    c.idcomments,c.comment, c.replied_for,
                    c.comment_date, c.user_id, c.post_id, 
                    u.username, u.img, u.type,
                    count(r.idreports) as reports
                    FROM comments c join users u on c.user_id = u.idusers
                    left join reports r on c.idcomments = r.comment_id
                 where c.post_id=? and replied_for is null
                 group by c.idcomments having reports < 100 and idcomments <= ?
                 order by c.idcomments desc
                 LIMIT 0,10
            `;
      const [comments] = await db.query(q2, [req.params.postid, highest]);

      return res.status(200).json(comments);
    } else {
      const q = `
            SELECT 
            c.idcomments, 
            c.comment,
            c.replied_for,
            c.comment_date, 
            c.user_id, 
            c.post_id, 
            u.username, 
            u.img, 
            u.type,
            count(r.idreports) as reports
            FROM comments c join users u on c.user_id = u.idusers
            left join reports r on c.idcomments = r.comment_id
         where c.post_id=? and replied_for is null
         group by c.idcomments having reports < 100 and idcomments < ?
         order by c.idcomments desc
         LIMIT 0,10
        `;

      const [comments] = await db.query(q, [
        req.params.postid,
        parseInt(req.query.low),
      ]);
      return res.status(200).json(comments);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
};

const getReplies = async (req, res) => {
  try {
    const q = `SELECT 
                    c.idcomments, 
                    c.comment,
                    c.replied_for,
                    c.comment_date, 
                    c.user_id, 
                    c.post_id, 
                    u.username, 
                    u.img, 
                    u.type FROM comments c join users u on c.user_id = u.idusers
                 where post_id=? and replied_for=?`;

    const values = [req.params.postid, req.params.commentid];

    const [replies] = await db.query(q, values);

    return res.status(200).json(replies);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Interval server error");
  }
};

const postComments = async (req, res) => {
  try {
    const q =
      "INSERT INTO comments(`comment`, `replied_for`, `comment_date`, `user_id`, `post_id`) VALUES(?)";

    const values = [
      req.body.comment,
      req.body.replied_for,
      req.body.date,
      req.userInfo.id,
      req.body.postid,
    ];

    const [resultPosting] = await db.query(q, [values]);

    return res.status(200).json("Comment has been created");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const deleteComments = async (req, res) => {
  try {
    const commentId = req.params.commentid;

    const q = "DELETE FROM comments WHERE `idcomments`= ? AND `user_id` = ?";

    const [resultDelete] = await db.query(q, [commentId, req.userInfo.id]);

    console.log(resultDelete);

    if (resultDelete.affectedRows === 0) {
      return res.status(401).json("You can only delete your posts.");
    } else {
      return res.status(200).json("Comment has been deleted");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  getComments,
  getReplies,
  postComments,
  deleteComments,
};
