import React from 'react'
import request from 'superagent'
import WikiParser from './wiki_parser'
import styles from './styles'

// Wikiメイン画面コンポーネント
export default class WikiShow extends React.Component {
    constructor (props) {
        super(props)
        const {params} = this.props.match
        this.state = {
            name: params.name,
            body: '',
            loaded: false
        }
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

    render () {
        if (!this.state.loaded) {
            return <p>読み込み中</p>
        }
        const wikiname = this.state.name
        const body = this.state.body
        const html = this.convertText(body)
        return (
            <div>
                <h1>{wikiname}</h1>
                <div style={styles.show}>{html}</div>
                <p style={styles.right}>
                    <a href={`/edit/${wikiname}`}>→このページを編集</a>
                </p>
            </div>
        )
    }

    // Wiki記法をReactオブジェクトに変換する
    convertText (src) {
        try {
            const nodes = WikiParser.parse(src)
            const lines = nodes.map((e, i) => {
                if (e.tag === 'ul') { // リスト
                    const list = e.items.map((s, j) => {
                        return <li key={`node${i}_${j}`}>{s}</li>
                    })
                    return <ul key={`node${i}`}>{list}</ul>
                }
                if (e.tag === 'a') {
                    return (
                        <div key={`node${i}`}>
                            <a href={`/wiki/${e.label}`}>→{e.label}</a>
                        </div>
                    )
                }
                return React.createElement(e.tag, {key: `node${i}`}, e.label)
            })
            return lines
        } catch (e) {
            console.error(e)
            return <div>**Wiki Parser Error**</div>
        }
    }
}
