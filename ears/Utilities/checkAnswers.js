export const checkAnswers = (arr1, arr2) =>{

     const set2 = new Set(arr2);
    return arr1.filter(item => set2.has(item)).length;
}