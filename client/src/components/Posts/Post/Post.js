import React, { useState, useEffect } from "react";
import * as api from "../../../api/index.js";
import useStyles from "./style";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Modal,
  TextField,
  Snackbar,
  IconButton,
  withStyles,
  Backdrop,
} from "@material-ui/core";
import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
import ThumbDownAltIcon from "@material-ui/icons/ThumbDownAlt";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import DeleteIcon from "@material-ui/icons/Delete";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import EditIcon from "@material-ui/icons/Edit";
import CloseIcon from "@material-ui/icons/Close";
import CommentIcon from "@material-ui/icons/Comment";
import SendIcon from "@material-ui/icons/Send";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import {
  deletePost,
  likePost,
  dislikePost,
  favoritePost,
  commentPost,
  deleteComment,
} from "../../../actions/posts";
import dotenv from "dotenv";
import { password1 } from "./password";

const Post = ({ post, setCurrentId, fromProfile }) => {
  dotenv.config();
  console.log(post);

  const history = useHistory();
  const [creatorID, setCreatorID] = useState("");

  useEffect(async () => {
    try {
      const { data } = await api.verify({
        token: localStorage.getItem("token"),
      });
      setCreatorID(data.id);
    } catch (error) {
      toast.error("Token Expired or Invalid. Sign In again.");
      localStorage.removeItem("token");
      history.push("/signin");
    }
  }, []);

  const classes = useStyles();
  const dispatch = useDispatch();

  const [openDelete, setOpenDelete] = useState(false); // for users
  const [openDeleteAdmin, setOpenDeleteAdmin] = useState(false); // for admin

  // function to open delete post option
  const handleOpen = () => {
    if (post.creator._id == creatorID) {
      setOpenDelete(true);
    } else {
      toast.info("You are trying to delete other's post!");
      setOpenDeleteAdmin(true);
    }
  };

  // function to close delete post option
  const handleClose = () => {
    setOpenDelete(false);
    setOpenDeleteAdmin(false);
  };

  // toggling the content of post
  const [contentToggle, setContentToggle] = useState(true);

  // Component of delete option popup
  function DeleteBody({ name }) {
    // input password
    const [password, setPassword] = useState("");

    const handleSubmit = async () => {
      if (openDelete) {
        // for user
        let matched = false;
        try {
          const { data } = await api.checkPassword({
            id: creatorID,
            password: password,
          });
          matched = data.status;
        } catch (error) {
          toast.error(error.message);
        }

        if (matched) {
          dispatch(deletePost(post._id)).then(() =>
            toast.success("Post Deleted.")
          );
          handleClose();
          toast.info("Deleting Post... It may take some seconds.");
        } else {
          setOpenDelete(false);
          toast.error("You have entered wrong password!");
        }
      } else if (openDeleteAdmin) {
        // for admin
        if (password === password1) {
          dispatch(deletePost(post._id)).then(() =>
            toast.success("Post Deleted.")
          );
          handleClose();
          toast.info("Deleting Post... It may take some seconds.");
        } else {
          setOpenDeleteAdmin(false);
          toast.error("You have entered wrong password!!!");
        }
      }
    };

    return (
      <div className={classes.paper}>
        <h2 id="simple-modal-title">
          <center>Please Enter {name} Password</center>
        </h2>
        <TextField
          name="message"
          variant="outlined"
          label="Enter Password"
          type="password"
          style={{ marginBottom: "1.5rem" }}
          className={classes.customInput}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          className={classes.paperButton}
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    );
  }

  const [settingsOption, setSettingsOption] = useState(false);

  function handleEditPost() {
    if (post.creator._id === creatorID) {
      setCurrentId(post._id);
    } else {
      toast.warn("You can't edit other's post!");
    }
    setSettingsOption(false);
  }

  const [commentToggle, setCommentToggle] = useState(false);

  const [commentMessage, setCommentMessage] = useState("");

  return (
    <>
      <Card className={classes.card}>
        <CardMedia
          className={classes.media}
          image={post.selectedFile}
          title={post.title}
        />
        <div className={classes.overlay}>
          <Typography variant="h6">{post.creator.name}</Typography>
          <Typography variant="body2">
            {moment(post.createdAt).fromNow()}
          </Typography>
        </div>

        <div className={classes.overlay2}>
          {settingsOption ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "space-between",
              }}
            >
              <IconButton
                style={{
                  color: "white",
                  backgroundColor: "rgba(150, 150, 250, 0.5)",
                }}
                onClick={() => setSettingsOption(false)}
              >
                <CloseIcon />
              </IconButton>
              {!fromProfile && (
                <IconButton
                  style={{
                    color: "white",
                    backgroundColor: "rgba(0, 255, 0, 0.5)",
                  }}
                  onClick={() => handleEditPost()}
                >
                  <EditIcon />
                </IconButton>
              )}
              <IconButton
                style={{
                  color: "white",
                  backgroundColor: "rgba(255, 0, 0, 0.5)",
                }}
                onClick={() => {
                  handleOpen();
                  setSettingsOption(false);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ) : (
            <IconButton
              style={{ color: "white" }}
              onClick={() => setSettingsOption(true)}
            >
              <MoreHorizIcon fontSize="default" />
            </IconButton>
          )}
        </div>

        {/* ----- Post's Tags ----- */}
        <div className={classes.details}>
          <Typography variant="body2" color="textSecondary">
            {post.tags.map((tag) => `#${tag} `)}
          </Typography>
        </div>

        {/* ----- Post's Title ----- */}
        <Typography className={classes.title} variant="h5" gutterBottom>
          {post.title}
        </Typography>

        {/* ----- Post's text content ----- */}
        {!contentToggle && (
          <CardContent>
            <Typography>{post.message}</Typography>
          </CardContent>
        )}

        {/* ----- Post's toggle button ----- */}
        <Button
          size="small"
          color="primary"
          onClick={() => setContentToggle((current) => !current)}
          id="Arrow"
        >
          {contentToggle ? (
            <>
              <ArrowDownwardIcon />
              Read more...
            </>
          ) : (
            <>
              <ArrowUpwardIcon />
              Read less...
            </>
          )}
        </Button>

        {/* ----- Post's Action Buttons ----- */}
        <CardActions className={classes.cardActions}>
          {/* ----- Like ----- */}
          <Button
            size="small"
            color="primary"
            onClick={() => {
              if (post.dislikes.includes(creatorID)) {
                dispatch(
                  dislikePost(post._id, {
                    userID: creatorID,
                    bool: true,
                  })
                );
              }
              dispatch(
                likePost(post._id, {
                  userID: creatorID,
                  bool: post.likes.includes(creatorID),
                })
              );
            }}
          >
            <ThumbUpAltIcon fontSize="small" style={{ paddingRight: "5" }} />
            {post.likes.length}
          </Button>

          {/* ----- Dislike ----- */}
          <Button
            size="small"
            color="primary"
            onClick={() => {
              if (post.likes.includes(creatorID)) {
                dispatch(
                  likePost(post._id, {
                    userID: creatorID,
                    bool: true,
                  })
                );
              }
              dispatch(
                dislikePost(post._id, {
                  userID: creatorID,
                  bool: post.dislikes.includes(creatorID),
                })
              );
            }}
          >
            <ThumbDownAltIcon fontSize="small" style={{ paddingRight: "5" }} />
            {post.dislikes.length}
          </Button>

          {/* ----- Comment ----- */}
          <Button
            size="small"
            color="primary"
            onClick={() => {
              setCommentToggle((current) => !current);
            }}
          >
            <CommentIcon fontSize="small" style={{ paddingRight: "5" }} />
            {post.comments.length}
          </Button>

          {/* ----- Heart ----- */}
          <Button
            color={`${
              post.favorites.includes(creatorID) ? "secondary" : "primary"
            }`}
            onClick={() => {
              dispatch(
                favoritePost(post._id, {
                  userID: creatorID,
                  bool: post.favorites.includes(creatorID),
                })
              );
            }}
          >
            {post.favorites.includes(creatorID) ? (
              <FavoriteIcon />
            ) : (
              <FavoriteBorderIcon />
            )}
          </Button>
        </CardActions>

        {commentToggle && (
          <div>
            <hr />
            <div style={{ display: "flex", margin: "0 1rem" }}>
              <input
                type="text"
                style={{
                  padding: "0.5rem",
                  outline: "none",
                  width: "80%",
                  borderRadius: "15px",
                  border: "1px solid gray",
                }}
                placeholder="Comment..."
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
              />
              <Button
                style={{ width: "20%", color: "#ffa500", padding: "0" }}
                onClick={() => {
                  console.log("Clicked!");
                  dispatch(
                    commentPost(post._id, {
                      userID: creatorID,
                      message: commentMessage,
                    })
                  ).then(() => {
                    setCommentMessage("");
                    console.log("Done");
                  });
                }}
              >
                <SendIcon />
              </Button>
            </div>
            <div style={{ padding: "0.5rem", paddingTop: "0" }}>
              {post.comments
                .slice(0)
                .reverse()
                .map((comment) => (
                  <div
                    style={{
                      margin: "0.5rem 0",
                      padding: "0.3rem",
                      borderRadius: "15px",
                      backgroundColor: "rgba(138, 138, 138, 0.15)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={comment.img}
                        alt="Profile"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "100%",
                          objectFit: "cover",
                          paddingRight: "0.3rem",
                        }}
                      />
                      <div style={{ fontSize: "1.3rem" }}>{comment.name}</div>
                    </div>
                    <div
                      style={{
                        paddingTop: "0.1rem",
                        fontStyle: "italic",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ paddingTop: "10px" }}>
                        {comment.message}
                      </div>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => {
                          console.log(creatorID);
                          console.log(comment.postedBy);
                          dispatch(
                            deleteComment(post._id, comment._id, {
                              userID: creatorID,
                            })
                          );
                        }}
                      >
                        {comment.postedBy === creatorID && <DeleteIcon />}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>

      {/* ----- Delete Popup for admin ----- */}
      <Modal
        open={openDeleteAdmin}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <DeleteBody name="Admin" />
      </Modal>

      {/* ----- Delete Popup for user ----- */}
      <Modal
        open={openDelete}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <DeleteBody name="your" />
      </Modal>
    </>
  );
};

export default Post;
