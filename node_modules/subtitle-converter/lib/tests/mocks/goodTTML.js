/* eslint-disable max-len */
/* eslint-disable no-tabs */
const goodTTML = `
<tt xml:lang="en"
xmlns="http://www.w3.org/ns/ttml"
xmlns:tts="http://www.w3.org/ns/ttml#styling">
 <head>
    <metadata xmlns:ttm="http://www.w3.org/ns/ttml#metadata">
     <ttm:title>TTML Example</ttm:title>
     <ttm:copyright>Thierry Michel 2015</ttm:copyright>
    </metadata>

    <styling xmlns:tts="http://www.w3.org/ns/ttml#styling">
     <style xml:id="s1" tts:color="red" tts:textAlign="center"  />
    </styling>
</head>

 <body>
    <div>
        <p xml:id="c1" begin="00:00:00.000" end="00:00:10.000">            
            Hello I am your first line.</p>
        <p xml:id="c2" begin="00:00:11.000" end="00:00:16.000">
            I am your second captions<br/>
            but with two lines.</p>
        <p xml:id="c3" xml:lang="fr" begin="00:00:17.000" end="00:00:21.123">
            Je suis le troisième sous-titre.</p>
        <p xml:id="c4" begin="00:00:22.000" end="00:00:30.333" >
            I am another caption with styles.</p>
        <p xml:id="c5" begin="00:00:31.000" end="00:00:36.000">
            I am the last caption displayed in red and centered.</p>
    </div>
 </body>
</tt>
`;

module.exports = goodTTML;
