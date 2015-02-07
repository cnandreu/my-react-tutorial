var converter = new Showdown.converter();


var HelloWorld = React.createClass({
  render : function () {
    return (
      <p>Hello world!</p>
    );
  }
});


var Comment = React.createClass({
  render : function () {
    var rawMarkup = converter.makeHtml(this.props.children.toString());
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
      </div>
    );
  }
});


var CommentList = React.createClass({
  render : function () {

      var commentNodes = this.props.data.map(function (comment) {

        return (
          <Comment author={comment.author}>
            {comment.text}
          </Comment>
        );

      });

      return (
        <div className="commentList">
          {commentNodes}
        </div>
      )
  }
});


var CommentForm = React.createClass({

  handleSubmit : function (e) {
    e.preventDefault();

    var author = this.refs.author.getDOMNode().value.trim();
    var text = this.refs.text.getDOMNode().value.trim();

    if (text && author) {
      this.props.onCommentSubmit({author: author, text: text});
      this.refs.author.getDOMNode().value = '';
      this.refs.text.getDOMNode().value = '';
    }
  },

  render : function () {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <hr />
        <input type="text" placeholder="Name" ref="author"/>
        <br />
        <input type="text" placeholder="Message" ref="text" />
        <br />
        <input type="submit" value="Post" />
        <hr />
      </form>
    );
  }
});


var CommentBox = React.createClass({

  loadCommentsFromServer : function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success : function (data) {
        this.setState({data: data});
      }.bind(this),
      failure : function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    })
  },

  handleCommentSubmit : function (comment) {

    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});

    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success : function (data) {
        this.setState({data: data});
      }.bind(this),
      failure: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    })
  },


  getInitialState : function () {
    return {data: []};
  },

  componentDidMount : function () {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  render : function () {
    return (
      <div className="commentBox">
        <HelloWorld />
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});


React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);

