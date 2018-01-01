require('dotenv');
const yelp = require('yelp-fusion');
const yelp_api = process.env.YELP_API;
const client = yelp.client(yelp_api);

module.exports = {

  find: (url) => {
    return global.knex.select('id').from('polls').where({ 'poll_url': url }).orWhere({ 'admin_url': url })
      .then(result => {
        return global.knex.raw(`SELECT poll_items.poll_item, polls.poll_title FROM poll_items JOIN polls ON polls.id=poll_items.poll_id WHERE poll_id='${result[0].id}' AND "irv_rank"=(SELECT MAX("irv_rank") FROM poll_items WHERE poll_id='${result[0].id}')`)
      })
      .then(result => {

        const pollTitle = result.rows[0].poll_title;
        const pollItem = result.rows[0].poll_item;

        const test = /eat|restaurant|food/.test(pollTitle);

        if (test) {

          console.log('starting yelp search');

          const searchRequest = {
            term: pollItem,
            location: 'vancouver, bc'
          };

          return client.search(searchRequest)
            .then(result => {
              const firstResult = result.jsonBody.businesses[0];

              const name = result.jsonBody.businesses[0].name;
              const image = result.jsonBody.businesses[0].image_url;
              const yelp_url = result.jsonBody.businesses[0].url;
              const rating = result.jsonBody.businesses[0].rating;
              const price = result.jsonBody.businesses[0].price;
              const map = result.jsonBody.businesses[0].name.replace(/\s/g, '+');

              const yelpObject = {
                name: name,
                image: image,
                yelp_url: yelp_url,
                rating: rating,
                price: price,
                map: map
              }

              const prettyJson = JSON.stringify(firstResult, null, 4);
              console.log(prettyJson);
              console.log('yelp object is')
              console.log(yelpObject)
              return yelpObject
            })
            .catch(error => {
              console.log('There is an error:', error);
            });
        } else {
          console.log('no yelp search');
          return
        }
      })
      .catch(error => {
        console.log('There is an error:', error);
      })


  }

}


/*

<!DOCTYPE html>
<html lang="en">

<head>
  <title>Results</title>

  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <link rel="icon" href="data:,">

  <link rel="stylesheet" href="/vendor/normalize-4.1.1.css" type="text/css" />
  <link rel="stylesheet" href="/vendor/border-box.css" type="text/css" />
  <link rel="stylesheet" href="/styles/layout.css" type="text/css" />

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" integrity="sha384-PsH8R72JQ3SOdhVi3uxftmaW6Vc51MKb0q5P2rRUpPvrszuE4W1povHYgTpBfshb" crossorigin="anonymous">


  <script type="text/javascript" src="/vendor/jquery-3.0.0.js"></script>
  <script type="text/javascript" src="/scripts/app.js"></script>
  <script type="text/javascript" src="/scripts/results.js"></script>
  <script type="text/javascript" src="/scripts/pie-chart.js"></script>

  <!-- External  javascript-->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.3/umd/popper.min.js" integrity="sha384-vFJXuSJphROIrBnz7yo7oB41mKfc8JzQZiCq4NCceLEaO4IHwicKwpJf9c9IpFgh" crossorigin="anonymous"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js" integrity="sha384-alpBpkh1PFOepccYVYDB4do5UnbKysX5WZXm3XxPqe5iKTfUKjNkCk9SaVuEZflJ" crossorigin="anonymous"></script>
  <script src="https://use.fontawesome.com/729922a123.js"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <!-- For mobile drag n drop-->
  <script type="text/javascript" src="/scripts/jquery.ui.touch-punch.js"></script>

</head>

<body>

  <!-- Modal -->
  <div class="modal fade" id="yelpmodal" tabindex="-1" role="dialog" aria-labelledby="yelpmodalaria" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle"><%=yelp.name%></h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <br>
          Rating: <%=yelp.rating%>
          Price: <%=yelp.price%>
          <iframe width="300" height="250" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/search?key=AIzaSyC24Uf59vQcxtmZSaPA7eBSsuLNuqNo5bQ&q=<%=yelp.map%>"
            allowfullscreen>
          </iframe>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary yelp-link">Yelp Link</button>
            </div>
          </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLongTitle">Instant Run-Off Voting</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
           Instant-runoff voting (IRV) is a voting method used in single-seat elections with more than two candidates. Instead of voting only for a single candidate, voters in IRV elections can rank the candidates in order of preference. Ballots are initially counted for each elector's top choice. If a candidate secures more than half of these votes, that candidate wins. Otherwise, the candidate in last place is eliminated and removed from consideration. The top remaining choices on all the ballots are then counted again. This process repeats until one candidate is the top remaining choice of a majority of the voters. When the field is reduced to two, it has become an "instant runoff" that allows a comparison of the top two candidates head-to-head.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary wiki-link">Wikipedia</button>
        </div>
      </div>
    </div>
  </div>

  <header>
    <% include ./partials/_header %>
  </header>

  <div class="d-flex justify-content-center main-container">
    <section>
      <h2 id='poll_title' class='text-center'>Results of poll:</h2>
      <h3 class='text-center'><%= result[0].poll_title %></h3>
      <div id="piechart"></div>
      <button type='button' class="btn btn-outline-primary btn-lg btn-block" id='refresh'>Refresh Results</button>
      <br><br>
      <div id="poll-closed">
        <div id="piechartIRV"></div>
        <% if (yelp) {%>
        <button type="button" class="btn btn-outline-success btn-lg btn-block" id='yelp-button' data-toggle="modal" data-target="#yelpmodal">I'm feeling lucky</button>
        <% } %>
        <button type='button' class="btn btn-outline-primary btn-lg btn-block" id='irv-once'>Advance IRV</button>
        <button type='button' class="btn btn-outline-primary btn-lg btn-block" id='irv-ff'>Fast Forward IRV</button>
        <button type="button" class="btn btn-outline-info btn-lg btn-block" id='irv-info' data-toggle="modal" data-target="#exampleModalCenter">What is Instant Run-Off Voting? </button>
        <button type='button' class="btn btn-outline-warning btn-lg btn-block" id='irv-reset'>Reset IRV</button>
      </div>
    </section>

  </div>

</body>

<!--passing data to FE javacsript -->
<script>
  var result = <%-JSON.stringify(result)%>;
  var yelp = <%-JSON.stringify(yelp) %>;
</script>

</html>




*/