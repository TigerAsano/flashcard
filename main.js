const bookConfigs = {
  "leap": {
    rangeFilter: (data, start, end) => data.slice(start - 1, end),
    processItem: (item, { meaning }) => {
      if (meaning && item.means && item.means[meaning - 1]) {
        const newBackText = item.means[meaning - 1];
        if (newBackText) {
          return { ...item, backText: newBackText };
        }
        return null; 
      }
      return item;
    },
    archiveId: (item) => item.number,
  },
  "leap_second": {
    rangeFilter: (data, start, end) => data.slice(start - 1, end),
    processItem: (item, { meaning }) => {
      if (meaning && item.means && item.means[meaning - 1]) {
        const newBackText = item.means[meaning - 1];
        if (newBackText) {
          return { ...item, backText: newBackText };
        }
        return null;
      }
      return item;
    },
    archiveId: (item) => item.number,
  },
  "leap_basic": {
    rangeFilter: (data, start, end) => data.slice(start - 1, end),
    processItem: (item, { meaning }) => {
      if (meaning && item.means && item.means[meaning - 1]) {
        const newBackText = item.means[meaning - 1];
        if (newBackText) {
          return { ...item, backText: newBackText };
        }
        return null;
      }
      return item;
    },
    archiveId: (item) => item.number,
  },
  "315": {
    rangeFilter: (data, start, end) => data.slice(start - 1, end),
    archiveId: (item) => item.number,
  },
  "EssentialEnglishExpressions": {
    rangeFilter: (data, start, end) => data.slice(start - 1, end),
    archiveId: (item) => item.number,
  },
  "worldHistory-10min-test": {
    rangeFilter: (data, start, end) => data.filter(v => v.number >= start && v.number <= end),
    processItem: (item) => {
      return { ...item, number: item.numberText };
    },
    archiveId: (item) => item.numberText, 
  },
  "japaneseHistory-10min-test": {
    rangeFilter: (data, start, end) => data.filter(v => v.number >= start && v.number <= end),
    processItem: (item) => {
      return { ...item, number: item.numberText };
    },
    archiveId: (item) => item.numberText, 
  }
};

/**
 * 指定された条件に基づいて単語リストを取得し、処理する非同期関数。
 * @param {string} subject - 単語帳の主題 (例: "leap", "315")。
 * @param {number} start - 出題範囲の開始番号。
 * @param {number} end - 出題範囲の終了番号。
 * @param {string} mode - モード（この関数では直接使用しない）。
 * @param {number} num - 取得する問題数（この関数では直接使用しない）。
 * @param {string} meaning - 特定の意味番号（leapシリーズ用）。
 * @param {boolean} reverse - 表裏を逆にするかどうかのフラグ。
 * @returns {Promise<Array|boolean>} 処理済みの単語データ配列、またはエラー時にfalse。
 */
async function getList(start,end,subject,mode,num=8,meaning, reverse) {
  [start,end,subject] = toDefault(start,end,subject);
  
  const data = await getData(subject,start,end,meaning, reverse);
  if(!data) return false;
  
  const questions = random(data,num);

  const contents = getContents.flash(questions);
  const numbers = getNumbers.flash(questions);
  return [contents,numbers];
}

async function getData(subject, start, end, meaning, reverse) {
  const archiveWords = window.localStorage.getItem("IIIIII" + subject)?.split(",") || [];
  let data;

  try {
    const response = await fetch(`./${subject}.json`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    data = await response.json();
  } catch (e) {
    console.error("Failed to fetch data:", e);
    return [];
  }
  
  const config = bookConfigs[subject];
  if (!config) {
    console.error(`Configuration for subject "${subject}" not found.`);
    return [];
  }
  
  if (reverse) {
    data = data.map(item => ({
      ...item,
      frontText: item.backText,
      backText: item.frontText
    }));
  }

  let items = config.rangeFilter(data, start, end);
  
  if (config.processItem) {
    items = items.map(item => config.processItem(item, { meaning })).filter(Boolean); // nullになったアイテムを除外
  }

  items = items.filter(item => !archiveWords.includes(String(config.archiveId(item))));
  
  return items;
}

const sessionId = Date.now();

const getNumbers = {
  flash :questions => {
    const numbers = [];
    for(let i=0,l=questions.length;i<l;i++){
      numbers.push(questions[i].number,questions[i].number);
    }
    return numbers;
  }
}

const getContents = {
  flash : questions => {
    const contents = [];
    for(let i=0,l=questions.length;i<l;i++){
      const {frontText,backText,number} = questions[i];
      contents.push(frontText,number + "\n" + backText);
    }
    return contents;
  }
}

function toDefault(start,end,subject){
  const bookElement = document.querySelector(`.book-item[data-subject="${subject}"]`);
  const max = bookElement ? bookElement.dataset.max : end;

  start = start ? Number(start) : 1;
  end = end ? Number(end) : max;

  if(start > end){
    [start , end] = [end,start];
  }

  return [start,end,subject];
}

function random(array,num){
   for (let i = array.length - 1; i > 0; i--) {
      const random = Math.floor(Math.random() * (i+1));
      const tmp = array[i];
      array[i] = array[random];
      array[random] = tmp;
  }
  return array.slice(0,num);
}
