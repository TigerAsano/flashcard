async function getList(start,end,subject,mode,num=8,meaning, reverse) {
  
  [start,end,subject] = toDefault(start,end,subject);
  
  const data = await getData(subject,start,end,meaning, reverse);
  if(!data) return false;
  
  const questions = random(data,num);

  const contents = getContents.flash(questions);
  const numbers = getNumbers.flash(questions);
  return [contents,numbers];

}

const sessionId = Date.now();

async function getData(subject,start,end,meaning, reverse){
  
  const  archiveWords = window.localStorage.getItem("IIIIII" + subject)?.split(",") || [];
  let res;

  if(subject === "leap" || subject === "leap_second" || subject === "315" || subject === "EssentialEnglishExpressions" || subject === "worldHistory-10min-test"){
    await fetch(`./${subject}.json`).then(json => json.json()).then(data => res = data);
  } else {
    return [];
  }

  if (reverse) {
    res = res.map(item => ({
      ...item,
      frontText: item.backText,
      backText: item.frontText
    }));
  }
  
  if(subject === "leap" || subject === "leap_second"){
    if(meaning){
      return res.splice(start-1,end-start).map(json => {
        json.backText = json.means[meaning-1];
        return json;
      }).filter(v => v.backText);
    }
    return res.splice(start-1,end-start).filter(v => !archiveWords.includes(`${v.number}`));
  }else if(subject === "315" || subject === "EssentialEnglishExpressions"){
    return res.splice(start-1,end-start).filter(v => !archiveWords.includes(`${v.number}`));
  }else if(subject === "worldHistory-10min-test"){
    return res.filter(v => v.number >= start && v.number <= end).map(v => {v.number = v.numberText;return v}).filter(v => !archiveWords.includes(`${v.numberText}`));
  }

  return [];

}

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

function getHomePage(){
  return HtmlService.createHtmlOutputFromFile("urlGenerator").getContent();
}

function toDefault(start,end,subject){

  if(subject === "leap"){
    start = start?start:1;
    end = end?end:1936;
  }else if(subject === "315"){
    start = start?start:1;
    end = end?end:315;
  }

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
  return array.splice(0,num);
}
