const db = require("../db");
const jwt = require("jsonwebtoken");

/*
const getMessages = (req, res) => {
    console.log(`Getting messages from ${req.params.fromid}`)
}
*/

const getAllUsers = async (req, res) => {
  try {
    const q = `select idusers, username, first_name, last_name, img from users
         where idusers !=? and (first_name like concat('%', ?, '%') or last_name like
          concat('%', ?, '%') or username like concat('%', ?, '%'))
           order by last_name asc LIMIT 0,10`;

    const [allUsers] = await db.query(q, [
      req.userInfo.id,
      req.query.q,
      req.query.q,
      req.query.q,
    ]);

    return res.status(200).json(allUsers);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const isMemberOfConversation = async (req, res) => {
  const q =
    "select * from group_member where user_id=? and conversation_id = ?";

  const [result] = await db.query(q, [
    req.userInfo.id,
    req.body.conversation_id || req.params.id,
  ]);
  if (result.length === 0) {
    return [];
  }

  return result;
};

const postMessage = async (req, res) => {
  try {
    //CHECK USER BEFORE SENDING MESSAGE

    const isMember = await isMemberOfConversation(req, res);

    if (isMember.length === 0)
      return res.status(404).json("You are not part of this conversation");

    const q =
      "insert into message(`message_text`, `sent_datetime`, `from_id`, `conversation_id`) VALUES(?) ";

    const values = [
      req.body.message_text,
      req.body.sent_datetime,
      req.userInfo.id,
      req.body.conversation_id,
    ];

    const [postMessage] = await db.query(q, [values]);

    return res.status(200).json("Message was sent");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const createConversation = async (req, res) => {
  try {
    const q = "insert into conversation(conversation_name) VALUES(?)";
    //console.log(req.body);

    const [rows, fields] = await db.execute(q, [req.body.conversation_name]);

    //console.log(typeof rows.insertId);
    // console.log(typeof req.body.group_members_ids[0]);
    //console.log(typeof req.body.joined_date);

    const q2 =
      "insert into group_member(`user_id`, `conversation_id`, `joined_date`) VALUES ?";

    const length = req.body.group_members_ids.length;
    //console.log(rows);
    //console.log(length);
    let values_2 = [];
    for (var i = 0; i < length; i++) {
      member_id = req.body.group_members_ids[i];
      var values_here = [member_id, rows.insertId, req.body.joined_date];
      values_2.push(values_here);
    }

    values_2.push([req.userInfo.id, rows.insertId, req.body.joined_date]); //Adding myself to the group

    //console.log(values_2);

    const [resultCreatingConv] = await db.query(q2, [values_2]);
    return res.status(200).json("Data has been added");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const listAvavilableConversations = async (req, res) => {
  try {
    const q = `select conversation_id, conversation_name, img, user_id, 
        idgroup_member, joined_date from conversation conv
        join group_member g on conv.idconversation = g.conversation_id
            where user_id = ?
        `;

    const [availableConversations] = await db.query(q, [req.userInfo.id]);
    return res.status(200).json(availableConversations);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const getMessages = async (req, res) => {
  try {
    const isMember = await isMemberOfConversation(req, res);

    if (isMember.length === 0)
      return res.status(404).json("You are not part of this conversation");

    const q = `select idmessage, message_text,
                            sent_datetime,
                            from_id,
                            conversation_id,
                            username as from_name,
                            img as from_img from message m
                            join users u on u.idusers=m.from_id
                            where conversation_id = ? order by sent_datetime asc
                        `;

    const [messages] = await db.query(q, [req.params.id]);
    return res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  getMessages,
  postMessage,
  getAllUsers,
  createConversation,
  listAvavilableConversations,
};
