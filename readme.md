#Video Editor Core

* videoEditorのコア部分です。主に、動画のプレビュー,書き出し(エンコード)の機能を提供します。
* init()実行時に引数として受け取ったcanvas要素にプレビューを描画します。
* ※UI部分は含まれていません。

## 使用の流れ
1.videoEditorCoreを読み込む
2.プレビューを描画したいcanvasを引数に取り、init()する
3.videoTrack,audioTrack,effectTrack,keyframeEffectTrackをセットする
4.再生や書き出しができる
5.必要に応じて、都度videoTrack,audioTrack,effectTrackをセットする

## 使用の流れ（詳細）
```javascript
import videoEditorCore from "videoEditorCore.jsのパス";
videoEditorCore.init(プレビュー用canvas要素);

// 各Trackの詳細については後述。
videoEditorCore.setVideoTrack(videTrack);
videoEditorCore.setAudioTrack(audioTrack);
videoEditorCore.setEffectTrack(effectTrack);
videoEditorCore.setKeyframeEffectTrack(keyframeEffectTrack);

videoEditorCore.preview.play(0);//startTime:再生開始時間[秒]

```
### プロパティ
```ts
readonly videoTrack 
```
<details>
<summary>（詳細）</summary>

* `setVideoTrack()`で設定したビデオトラックが入ります。ここに値を直接代入するとたまにバグるので、トラックを設定する際は`setVideoTrack()`を用いてください。

</details>

```ts
readonly audioTrack 
```

```ts
readonly effectTrack 
```

```ts
readonly keyframeEffectTrack
```


### メソッド
```ts
void setVideoTrack(videoTrack)

//シーク
videoEditorCore.preview.seekTo(time);//time:ジャンプする時間[秒]

//書き出し
videoEditorCore.encoder.encode();//ダウンロードまで行われる
```

【5.必要に応じて、都度videoTrack,audioTrack,effectTrackをセットする】
3.と同様。


・使用例はtestディレクトリを参考にしてください。

[trackのプロパティ]
・トラックの各クリップは、以下のプロパティを必ず持つ必要があります。
videoTrack内のクリップ
    .id : mediaIdのこと
    .element
    .startTime
    .endTime
    .relativeStartTime
    .gain

audioTrack内のクリップ
    .id
    .element
    .startTime
    .endTime
    .relativeStartTime
    .gain

effectTrack内のクリップ
    .function
    .startTime
    .endTime

その他、各クリップは必要に応じて別のプロパティを持つ場合があります(特にeffectTrack)