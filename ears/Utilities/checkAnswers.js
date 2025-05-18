export const checkAnswers = (arr1, arr2) =>{
    if(arr2.length == 0)return 0;
     const set2 = new Set(arr2);
    return arr1.filter(item => set2.has(item)).length;
}