'use strict';
// Node.jsに用意されたファイルを扱うためのモジュールの呼び出し
const fs = require('fs');
// ファイルを一行読み込む
const readline = require('readline');
// popu-pref.csv ファイルから、ファイルを読み込みを行う Stream（ストリーム）を生成
const rs = fs.createReadStream('./popu-pref.csv');
// Stream（ストリーム）を利用する
const rl = readline.createInterface({input: rs, output:{}});
// Map生成(key: 都道府県 value: 集計データのオブジェクト)
const prefectureDataMap = new Map();

// line イベントが発生したタイミングで、コンソールに引数 lineString の内容が出力される
rl.on('line', lineString => {
    // 読み込んだデータに対して','で分割。そのデータをcolumns配列に入れる
    const columns = lineString.split(',');
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[2]);
    // year が、 2010 または 2015 であるとき
    if(year === 2010 || year === 2015){
        // prefectureDataMap からデータを取得
        let value = prefectureDataMap.get(prefecture);
        // value の値が Falsy の場合に、value に初期値となるオブジェクトを代入。
        // 最初は何も入ってないので処理を実行する
        if(!value){
            value = {
                popu10: 0, // 2010 年の人口
                popu15: 0, // 2015 年の人口
                change: null // 人口の変化率 初期値ではnull
            };
        }
        // 人口のデータを連想配列に保存
        if(year === 2010){
            value.popu10 = popu;
        }
        if(year === 2015){
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});
    // closeイベント：全ての行を読み込み終えたら実行
    rl.on('close', () => {
        // 変化率の計算
        // Map や Array の中身を of の前で与えられた変数に代入して for ループする
        for(let [key, value] of prefectureDataMap){ 
            value.change = value.popu15 / value.popu10;
        }
        // 連想配列を普通の配列に変換する処理 Map → Array
        // 更に、Array の sort 関数を呼んで無名関数を渡している
        // pair1 と　pair2 を比較
        // 前者の引数 pair1 を 後者の引数 pair2 より前にしたいときは、負の整数、
        // pair2 を pair1 より前にしたいときは、正の整数、
        // pair1 と pair2 の並びをそのままにしたいときは 0 を返す必要があります。
        // ここでは変化率の降順に並び替えを行いたいので、 pair2 が pair1 より大きかった場合、pair2 を pair1 より前にする
        const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
            return pair2[1].change - pair1[1].change;
        });
        // ここで出てくるmapはmap関数（Array の要素それぞれを、与えられた関数を適用した内容に変換する）
        // 綺麗に整形する
        const rankingString = rankingArray.map((key, value) => {
            return (
                key +
                ';' +
                value.popu10 +
                '=>' +
                value.popu15 +
                '変化率' +
                value.change
            );
        });
        // 各県各年男女のデータが集計された Map のオブジェクトを出力
        console.log(rankingArray);
    });
