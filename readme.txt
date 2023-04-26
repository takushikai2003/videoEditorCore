videoEditorのコア部分です。主に、動画のプレビュー,書き出し(エンコード)の機能を提供します。
※UI部分は含まれていません。init()実行時に引数として受け取ったcanvas要素にプレビューを描画します。

[使用の流れ]
1.videoEditorCoreを読み込む
2.プレビューを描画したいcanvasを引数に取り、init()する
3.videoTrack,audioTrack,effectTrackをセットする
4.再生や書き出しができる
5.必要に応じて、都度videoTrack,audioTrack,effectTrackをセットする

・使用例はtestディレクトリを参考にしてください。

[trackのプロパティ]
・トラックの各クリップは、以下のプロパティを必ず持つ必要があります。
videoTrack内のクリップ
    .element
    .startTime
    .endTime
    .relativeStartTime
    .gain

audioTrack内のクリップ
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