---
hide_table_of_contents: true
---

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Grid from '@mui/material/Grid';
import CardMedia from '@mui/material/CardMedia';
import GuideCard from '/src/components/guides-section/GuideCard/GuideCard.jsx'
import GuideLabel from '/src/components/guides-section/GuideLabel/GuideLabel.jsx'
import SearchBar from '/src/components/guides-section/SearchBar/SearchBar.jsx'
import Tags from '/src/components/guides-section/Tags/Tags.jsx'
import "/src/components/guides-section/styles.css";

# Guides

All guides are listed below, use the tags and/or search bar to filter them.

<Tags />
<br/>
<SearchBar />
<br/><br/>

<div className="guide-cards-container">
<GuideCard tags={["AWS", "Actions"]} logos={["AWS"]} title="Create cloud resources using IaC" description="blah blah blah"/>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</div>
<!-- <Grid container spacing={2} rowSpacing={2}>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
<Grid item item xs={12} sm={6} md={4}>
<GuideCard tags={["AWS", "Actions"]} logos={["Github", "AWS"]} />
</Grid>
</Grid> -->

