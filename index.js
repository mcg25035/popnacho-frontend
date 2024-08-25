var main = ()=>{
    var character = document.getElementsByClassName('character')[0];
    var count = document.getElementsByClassName('count')[0];
    var countNumber = 0;

    var updateCount = ()=>{
        count.innerHTML = countNumber;
    };

    document.addEventListener('mousedown', function(event) {
        character.classList.remove("nacho-close");
        character.classList.add("nacho-open");
        countNumber++;
        updateCount();
    });
    
    document.addEventListener('mouseup', function(event) {
        character.classList.remove("nacho-open");
        character.classList.add("nacho-close");
    });
}

document.addEventListener('DOMContentLoaded', main);