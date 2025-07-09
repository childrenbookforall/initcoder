const months = ["January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
]

export function formatDate(date){
    if(date){
        const dateString = date.getDate().toString() + " " + months[date.getMonth()] + " " + date.getFullYear().toString();
        return dateString;
    }
    else
        return 0;  
}