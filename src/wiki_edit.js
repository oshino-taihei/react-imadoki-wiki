import React from 'react'
import request from 'superagent'
import {Redirect} from 'react-router-dom'
import styles from './styles'

// 編集画面コンポーネント
export default class WikiEdit extends React.Component {
    constructor (props) {
        super(props)
        const {params} = this.props.match
        const name = params.name
        this.state = {
            name,
            body: '',
            loaded: false,
            jump: ''
        }
        this.bodyChanged = this.bodyChanged.bind(this)
    }

    bodyChanged (e) {
        this.setState({body: e.target.value})
    }

    // Wikiの内容を読み込み
    componentWillMount () {
        const wikiname = this.state.name
        request
          .get(`/api/get/${wikiname}`)
          .end((err, res) => {
              if (err) {
                  console.error(err)
                  return
              }
              this.setState({
                  body: res.body.data.body,
                  loaded: true
              })
          })
    }
    // 本文をサーバにポスト
    save () {
        const wikiname = this.state.name
        request
          .post(`/api/put/${wikiname}`)
          .type('form')
          .send({
              name: wikiname,
              body: this.state.body
          })
          .end((err, data) => {
              if (err) {
                  console.error(err)
                  return
              }
              this.setState({
                  jump: `/wiki/${wikiname}`
              })
          })
    }

    // 編集画面レンダリング
    render () {
        if (!this.state.loaded) {
            return <p>読み込み中</p>
        }
        if (this.state.jump !== '') {
            // メイン画面にリダイレクト
            return <Redirect to={this.state.jump} />
        }
        const wikiname = this.state.name
        return (
            <div style={styles.edit}>
                <h1><a href={`/wiki/${wikiname}`}>{wikiname}</a></h1>
                <textarea rows={12} cols={60} onChange={this.bodyChanged} value={this.state.body} /><br />
                <button onClick={e => this.save()}>保存</button>
            </div>
        )
    }
}