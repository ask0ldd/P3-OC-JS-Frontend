const api = 'http://localhost:5678/api/'
const gallery = document.querySelector(".gallery")

/*
<figure>
    <img src="assets/images/abajour-tahina.png" alt="Abajour Tahina">
    <figcaption>Abajour Tahina</figcaption>
</figure>*/

fetch(`${api}works`).then((response)=>{
    const readReponse = response.json()
    return readReponse
}).then((data) => {
    console.log(data)
    for(let i=0; i<Object.keys(data).length; i++)
    {
        let work = document.createElement("figure");
        work.innerHTML = `<img src="${data[i].imageUrl}" alt="Abajour Tahina" crossorigin="anonymous"><figcaption>${data[i].title}</figcaption>`
        gallery.append(work)
    }

})

function emptyGallery()
{
    gallery.innerHTML=""
}