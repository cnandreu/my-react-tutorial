var converter = new Showdown.converter();


var HelloWorld = React.createClass({
  render : function () {
    return (
      <p>Hello world.</p>
    );
  }
});


var Comment = React.createClass({
  render : function () {
    var rawMarkup = converter.makeHtml(this.props.children.toString());
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          > {this.props.author}
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
      );
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


var Utils = {
  makeNetworkCall : function (url, method, data, cb) {
    $.ajax({
      url: url,
      type: method,
      data: data,
      dataType: 'json',
      success : cb,
      failure : function (xhr, status, err) {
        console.error(url, status, err.toString());
      }
    });
  }
};


var CommentBox = React.createClass({

  loadCommentsFromServer : function () {
    Utils.makeNetworkCall(this.props.url, 'GET', null, function (data) {
      this.setState({data: data});
    }.bind(this));
  },

  handleCommentSubmit : function (comment) {

    //Shows comments on the UI before they are sent to the server.
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});

    Utils.makeNetworkCall(this.props.url, 'POST', comment, function () {
      this.setState({data: data});
    }.bind(this));
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
        <hr />
        <h1>Comments</h1>
        <hr />
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

