const badTextFormatted = `
1
01:00:05,446 --> 01:00:10,817
<i>Beijing, hazy sky</i>

2
02:00:10,817 --> 02:00:16,818
{an 1}
<br> This is a break tag in the second line

3
03:00:10,817 --> 03:00:16,818
>>Hello

4
04:00:10,817 --> 04:00:16,818
<br>World 
 df 

5
05:00:10,817 --> 05:00:16,818
>>Lorem             >ipsum       <

6
06:00:10,817 --> 06:00:16,818
>>{3}Hello{/3}  World!<><br>>{i}>{lorem j}This{i}>> is{/i} the second<<          line.


`;

module.exports = badTextFormatted;
