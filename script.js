const api = 'http://localhost:5678/api/'

let datas

fetch(`${api}works`).then((response)=>{
    const readReponse = response.json()
    return readReponse
}).then((data) => {

    datas = { ... data }
    console.log(datas)
    /*
    Object.entries(datas.category)
    Object.assign()
    Object.fromEntries()
    Object.keys()
    Object.values()
    Array.prototype.includes()

    */
    let categories = []
    let pushedIds = []
    for(let i=0; i<Object.keys(datas).length; i++)
    {
        if(pushedIds.includes(datas[i].category.id) === false){
        //categories.push([datas[i].category.id,datas[i].category.name])
        categories.push(datas[i].category)
        pushedIds.push(datas[i].category.id)
        }
    }

    /*let categories2 = new Set();
    for(let i=0; i<Object.keys(datas).length; i++)
    {
        categories2.add(datas[i].category.name)
    }*/

    //let uniq = new Set(...catWithDuplicates)
    console.log(categories)

    //console.log(uniq)
    //console.log("spread duplicates : ", [...catWithDuplicates])
})


/*let test = [[1, "ezaezeaz"],[2, "tgzrrazr"],[1, "ezaezeaz"]]
console.log(test.includes([1, "ezaezeaz"]))
console.log([1, "ezaezeaz"] === [1, "ezaezeaz"])*/