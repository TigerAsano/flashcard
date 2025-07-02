
async function getList(start,end,subject,mode="test",num=8,meaning) {
  

  [start,end,subject] = toDefault(start,end,subject);
  
  const data = await getData(subject,start,end,meaning)//.filter(v => v);
  if(!data) return false;
  
  const questions = random(data,num)//.map(a => JSON.parse(a));

  const contents = getContents[mode](questions);
  const numbers = getNumbers[mode](questions);
  return [contents,numbers];

}

const sessionId = Date.now();

async function getData(subject,start,end,meaning){
  
  const  archiveWords = window.localStorage.getItem("IIIIII" + subject)?.split(",") || [];

  if(subject === "leap"){
    let res;
    await fetch(`./leap.json?t=${sessionId}`).then(json => json.json()).then(json => res = json);
    if(meaning){
      return res.splice(start-1,end-start).map(json => {
        json.backText = json.means[meaning-1];
        return json;
      }).filter(v => v.backText);
    }
    return res.splice(start-1,end-start).filter(v => !archiveWords.includes(`${v.number}`));
  }else if(subject === "315" || subject === "EssentialEnglishExpressions"){
    let res;
    await fetch(`./${subject}.json?t=${sessionId}`).then(json => json.json()).then(json => res = json);
    return res.splice(start-1,end-start).filter(v => !archiveWords.includes(`${v.number}`));
  }else if(subject === "worldHistory-10min-test"){
    let res;
    console.log(sessionId);
    await fetch(`./${subject}.json?t=${sessionId}`).then(json => json.json()).then(json => res = json);
        return res.filter(v => v.number >= start && v.number <= end).map(v => {v.number = v.numberText;return v}).filter(v => !archiveWords.includes(`${v.numberText}`));

  }

  return [];

}

const getNumbers = {
  test : questions => {
    const numbers = [];
    for(let i=0,l=questions.length;i<l;i++){
      numbers.push(questions[i].number);
    }
    return numbers;
  },
  flash :questions => {
    const numbers = [];
    for(let i=0,l=questions.length;i<l;i++){
      numbers.push(questions[i].number,questions[i].number);
    }
    return numbers;
  },
  auto :questions => {
    const numbers = [];
    for(let i=0,l=questions.length;i<l;i++){
      numbers.push(questions[i].number,questions[i].number);
    }
    return numbers;
  }
}

const getContents = {

  test : questions => {

    const contents = [];

    const answers = [];
    for(let i=0,l=questions.length;i<l;i++){

      console.log(questions[i])

      const {frontText,backText} = questions[i];
      contents.push(
        {
          text : frontText,
          isQuestion : true
        }
      );
      answers.push(backText);

    }

    const hoge = (arr, size) => arr.flatMap((_, i, a) => i % size ? [] : [a.slice(i, i + size)]);

    contents.push(...hoge(answers,8).map(d => {

      return {
        text : d.join("\n\r"),
        isQuestion : false
      };
    }));

    return contents;
  },
  flash : questions => {

    const contents = [];

    for(let i=0,l=questions.length;i<l;i++){
      const {frontText,backText,number} = questions[i];
      contents.push(frontText,number + "\n" + backText);
    }

    return contents;
    
  },

  memory : questions => {

    const contents = [];

    for(let i=0,l=questions.length;i<l;i++){
      const {frontText,backText} = questions[i];
      contents.push(frontText,backText.split(" ")[1]);
    }

    return contents;

  },
  auto : questions => {

    const contents = [];

    for(let i=0,l=questions.length;i<l;i++){
      const {frontText,backText,number} = questions[i];
      contents.push(frontText,number + "\n" + backText);
    }

    return contents;
    
  },


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
