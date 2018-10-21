(function ($) {
    'use strict';
    // INIT
    // radio values
    var $radios_allowneg = $('input:radio[name=allowneg]');
    if ($radios_allowneg.is(':checked') === false) {
        $radios_allowneg.filter('[value=false]').prop('checked', true);
    }
    var $radios_uncontestedcost = $('input:radio[name=uncontestedcost]');
    if ($radios_uncontestedcost.is(':checked') === false) {
        $radios_uncontestedcost.filter('[value=Zero]').prop('checked', true);
    }

    // DATA
    var pageData = {
        currentBidderId: 0,
        Bidders: [],
        Fact: {
            fact_MdC: true,
            fact_E: true,
            fact_WA: true,
            fact_V1: true,
            fact_RC: false,
            fact_LC: false,
            fact_V2: false
        },
        AllowNegBet: false,
        UncontestedPays: 'Zero',  // 'Zero', 'One', 'Full'
        showResults: true,
        showDetails: false,
        returnPage: '#home-container',
        showingAboutPage: false,
    };

    // DECLARES
    var default_Bidder = {
        Id: -1,
        Name: "Player",
		ShortName: "P",
        DefaultName: "Player",
		DefaultShortName: "P",
        Items: [],
        pendingBid_faction: "MdC",
        isSet_pendingBid_faction: false,
        pendingBid_cost: 0,
        isSet_pendingBid_cost: false,
    };

    // FUNCTIONS
    var toggleFaction = function (factionButton, faction) {
        if (factionButton) {
            toggleFactionActive($(factionButton), pageData.Fact[faction]);
            pageData.Fact[faction] = !!!pageData.Fact[faction];
            updateStartButtonState();
        }
    };

    var toggleFactionActive = function ($factionButton, factionBool) {
        if (factionBool) {
            // turn off
            $factionButton.removeClass('btn-success');
            $factionButton.addClass('btn-dark');
        } else {
            // turn on
            $factionButton.removeClass('btn-dark');
            $factionButton.addClass('btn-success');
        }
    };

    var updateStartButtonState = function () {
        var startButton = document.getElementsByName('start-button')[0];
        var playerCount = bidderControl.GetFactionCount();
        if (playerCount >= 2) {
            $(startButton).prop('disabled', false);
        } else {
            $(startButton).prop('disabled', true);
        }
    };

    var updateNegativeBidButtonState = function () {
        var div = document.getElementById('display-negative-bid-buttons');
        if (pageData.AllowNegBet) {
            $(div).show();
        } else {
            $(div).hide();
        }
    };

    var updateFactionBidButtonState = function () {
        var div_MdC = document.getElementsByName('bid-fact-div-MdC')[0];
        var div_E = document.getElementsByName('bid-fact-div-E')[0];
        var div_WA = document.getElementsByName('bid-fact-div-WA')[0];
        var div_V1 = document.getElementsByName('bid-fact-div-V1')[0];
        var div_RC = document.getElementsByName('bid-fact-div-RC')[0];
        var div_LC = document.getElementsByName('bid-fact-div-LC')[0];
        var div_V2 = document.getElementsByName('bid-fact-div-V2')[0];

        if (pageData.Fact.fact_MdC) { $(div_MdC).show(); } else { $(div_MdC).hide(); }
        if (pageData.Fact.fact_E) { $(div_E).show(); } else { $(div_E).hide(); }
        if (pageData.Fact.fact_WA) { $(div_WA).show(); } else { $(div_WA).hide(); }
        if (pageData.Fact.fact_V1) { $(div_V1).show(); } else { $(div_V1).hide(); }
        if (pageData.Fact.fact_RC) { $(div_RC).show(); } else { $(div_RC).hide(); }
        if (pageData.Fact.fact_LC) { $(div_LC).show(); } else { $(div_LC).hide(); }
        if (pageData.Fact.fact_V2) { $(div_V2).show(); } else { $(div_V2).hide(); }
    };

    var updateBidTableState = function () {
        var bids_none = document.getElementById('display-bids-none');
        var bids_display = document.getElementById('display-bids-div');
        var bidCount = pageData.Bidders[pageData.currentBidderId].Items.length;
        if (bidCount == 0) {
            $(bids_display).hide();
            $(bids_none).show();
        } else {
            $(bids_none).hide();
            $(bids_display).show();
        }
    };

    var refreshBidTable = function () {
        var items = _.cloneDeep(pageData.Bidders[pageData.currentBidderId].Items);
        $('#display-bids-table').bootstrapTable({ data: items });
        $('#display-bids-table').bootstrapTable("load", items);
        updateBidTableState();
    };

    var refreshResultsTable = function (results) {
        $('#display-results-table').bootstrapTable({ data: results });
        $('#display-results-table').bootstrapTable("load", results);
    };

    var defaultResultsTableState = function () {
        var results = document.getElementById('display-results-div');
        var results_details = document.getElementById('display-results-details-div');
        pageData.showResults = true;
        $(results).show();
        pageData.showDetails = false;
        $(results_details).hide();
    };

    var toggleResultsTableState = function () {
        var results = document.getElementById('display-results-div');
        var results_details = document.getElementById('display-results-details-div');
        if (pageData.showResults) {
            pageData.showResults = false;
            $(results).hide();
            pageData.showDetails = true;
            $(results_details).show();
        } else {
            pageData.showResults = true;
            $(results).show();
            pageData.showDetails = false;
            $(results_details).hide();
        }
    };

    var refreshDetailsTable = function (results) {
        $('#display-results-details-table').bootstrapTable({ data: results });
        $('#display-results-details-table').bootstrapTable("load", results);
    };

    var clearBidTable = function () {
        $('#display-bids-table').bootstrapTable('removeAll');
    };

    var toggleAllowNeg = function (whichradio) {
        pageData.AllowNegBet = Boolean(whichradio === 1);
    };

    var setUncontestedPayment = function (value) {
        pageData.UncontestedPays = value; // 'Zero', 'One', 'Full'
    };

    var setPageNumber = function (value) {
        document.getElementById('label-page-number').innerHTML = value;
    };

    var setNextButtonText = function (value) {
        document.getElementsByName('entry-next-button')[0].innerHTML = value;
    };

    var setPlayerName = function (value) {
        document.getElementById('label-entry-player-name').innerHTML = value;
    };
	
	var getFactionFullName = function (which) {
		var ret = "?";
		switch(which)
		{
			case "MdC":
			ret = "Marquise de Cat";
				break;
			case "E":
			ret = "Eyrie Dynasties";
				break;
			case "WA":
			ret = "Woodland Alliance";
				break;
			case "V1":
			ret = "Vagabond (1)";
				break;
			case "RC":
			ret = "Riverfolk Company";
				break;
			case "LC":
			ret = "Lizard Cult";
				break;
			case "V2":
			ret = "Vagabond (2)";
				break;
		}
		return ret;
	}

    // FUNCTIONS - FoC
    var FOC = {
        resetPage: function () {
            biddingControl.UnSelectAll_BidFactionButtons();
            biddingControl.UnSelectAll_BidCostButtons();
            setPageNumber("");
            navigateToPage('#home-container');
        },
        startBidding: function () {
            var playerCount = bidderControl.GetFactionCount();
            if (playerCount >= 2) { // must have choosen at least 2 factions to start bid entry
                bidderControl.RemoveAll();
                bidderControl.InitDefault();
                for (var x = 0; x < playerCount; x++) {
                    bidderControl.Add();
                }
                pageData.currentBidderId = 0;
                FOC.setupEntryForm();
                navigateToPage('#entry-container');
            } else {
                FOC.resetPage();
            }
        },
        setupEntryForm: function () {
            if (pageData.Bidders.length > pageData.currentBidderId) {
                // init
                updateNegativeBidButtonState();
                updateFactionBidButtonState();
                biddingControl.UnSelectAll_BidFactionButtons();
                biddingControl.UnSelectAll_BidCostButtons();
                setNextButtonText("NEXT"); // default bidder entry label
                // setup entry page
                setPlayerName(pageData.Bidders[pageData.currentBidderId].Name);
                setPageNumber((pageData.currentBidderId + 1) + " / " + pageData.Bidders.length);
                clearBidTable();
                updateBidTableState();
            }
        },
        moveToNextEntry: function () {
            pageData.currentBidderId++;
            if (pageData.Bidders.length > pageData.currentBidderId) {
                // init
                biddingControl.UnSelectAll_BidFactionButtons();
                biddingControl.UnSelectAll_BidCostButtons();
                if (pageData.Bidders.length - 1 == pageData.currentBidderId) {
                    setNextButtonText("FINISH"); // final bidder entry label
                }
                // setup entry page
                setPlayerName(pageData.Bidders[pageData.currentBidderId].Name);
                setPageNumber((pageData.currentBidderId + 1) + " / " + pageData.Bidders.length);
                clearBidTable();
                updateBidTableState();
            } else {
                // cleanup
                setPageNumber("");
                navigateToPage('#loading-container');
                // no more bidders, calculate results
                VCG.Pack();
            }
        },
        toggleAboutDisplay: function () {
            if (pageData.showingAboutPage) {
                navigateToPage(pageData.returnPage);
                pageData.showingAboutPage = false;
            } else {
                navigateToPage('#about-container');
                pageData.showingAboutPage = true;
            }
        },
    };

    // FUNCTION - Nav
    var navigateToPage = function (divName) {
        // hide all
        $('#home-container').hide();
        $('#entry-container').hide();
        $('#loading-container').hide();
        $('#results-container').hide();
        $('#about-container').hide();
        // show one
        $(divName).show();
        // set page to show when closing about-container
        if (divName != '#about-container') {
            pageData.returnPage = divName;
        }
    };

    // FUNCTION - Utility
    // to check if a bid set has multiple bids for the same fact
    var uniquePropertyCount = function (arrayOfObj, propertyName) {
        var uniqueArray = arrayOfObj.filter(function (item, index, array) {
            return array.map(function (mapItem) { return mapItem[propertyName]; }).indexOf(item[propertyName]) === index;
        });
        return uniqueArray.length;
    };
    // to sort final bid sets by greatest value & least standard deviation
    var valuecompare = function (a, b) {
        if (a.Value < b.Value)
            return 1;
        if (a.Value > b.Value)
            return -1;
        if (a.Value == b.Value) {
            if (a.stdDev > b.stdDev)
                return 1;
            if (a.stdDev < b.stdDev)
                return -1;
        }
        var rand = Math.round(Math.random());
        if (rand == 1) {
            return 1;
        } else {
            return -1;
        }
        return 0;
    };
    // to reduce all bids by lowest bid, approaching 0 cost
    var floorCosts = function (costs) {
        var ret = [];
        var minCost = 9999;
        for (var x = 0; x < costs.length; x++) {
            if (costs[x] < minCost) { minCost = costs[x]; }
        }
        for (var y = 0; y < costs.length; y++) {
            ret.push(costs[y] - minCost);
        }
        return ret;
    };

    // CONTROL
    var bidderControl = {
        InitDefault: function () {
            default_Bidder.Id = 0;
            default_Bidder.Name = "Player";
			default_Bidder.ShortName = "P";
            default_Bidder.DefaultName = "Player";
			default_Bidder.DefaultShortName = "P";
            default_Bidder.Items = [];
            default_Bidder.pendingBid_faction = "MdC";
            default_Bidder.isSet_pendingBid_faction = false;
            default_Bidder.pendingBid_cost = 0;
            default_Bidder.isSet_pendingBid_cost = false;
        },
        Add: function () {
            default_Bidder.Id += 1;
            default_Bidder.Name = default_Bidder.DefaultName + " " + String(default_Bidder.Id);
			default_Bidder.ShortName = default_Bidder.DefaultShortName + String(default_Bidder.Id);
            var newBidder = _.cloneDeep(default_Bidder);
            pageData.Bidders.push(newBidder);
        },
        RemoveAll: function () {
            pageData.Bidders = [];
        },
        GetFactionCount: function () {
            var ret = 0;
            if (pageData.Fact.fact_MdC) { ret++; }
            if (pageData.Fact.fact_E) { ret++; }
            if (pageData.Fact.fact_WA) { ret++; }
            if (pageData.Fact.fact_V1) { ret++; }
            if (pageData.Fact.fact_RC) { ret++; }
            if (pageData.Fact.fact_LC) { ret++; }
            if (pageData.Fact.fact_V2) { ret++; }
            return ret;
        },
        ResetCurrentBid: function () {
            pageData.Bidders[pageData.currentBidderId].pendingBid_faction = "MdC";
            pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_faction = false;
            pageData.Bidders[pageData.currentBidderId].pendingBid_cost = 0;
            pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_cost = false;
        },
        TryAddItem: function (item) {
            var alreadyBid = VCG.DoesItemContainFaction(pageData.Bidders[pageData.currentBidderId].Items, item[0].faction);
            if (alreadyBid) {
                VCG.RemoveFactionFromItem(pageData.Bidders[pageData.currentBidderId].Items, item[0].faction);
            }
            pageData.Bidders[pageData.currentBidderId].Items.push(_.cloneDeep(item[0]));
            bidderControl.ResetCurrentBid();
            refreshBidTable();
        },
    };

    var biddingControl = {
        ChooseBidFaction: function (factionBidButton, faction) {
            biddingControl.UnSelectAll_BidFactionButtons();
            biddingControl.SelectBidButton(factionBidButton);
            // have they already chosen this faction?
            if (pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_faction &&
                pageData.Bidders[pageData.currentBidderId].pendingBid_faction == faction) {
                // unchoose
                pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_faction = false;
                biddingControl.UnSelectAll_BidFactionButtons();
            } else {
                // choose
                pageData.Bidders[pageData.currentBidderId].pendingBid_faction = faction;
                pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_faction = true;
            }
            biddingControl.CheckBid();
        },
        ChooseBidCost: function (costBidButton, cost) {
            biddingControl.UnSelectAll_BidCostButtons();
            biddingControl.SelectBidButton(costBidButton);
            // have they already chosen this bid cost?
            if (pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_cost &&
                pageData.Bidders[pageData.currentBidderId].pendingBid_cost == cost) {
                // unchoose
                pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_cost = false;
                biddingControl.UnSelectAll_BidCostButtons();
            } else {
                // choose
                pageData.Bidders[pageData.currentBidderId].pendingBid_cost = cost;
                pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_cost = true;
            }
            biddingControl.CheckBid();
        },
        CheckBid: function () {
            // check if both a fact and a cost is chosen
            if (pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_faction &&
                pageData.Bidders[pageData.currentBidderId].isSet_pendingBid_cost) {
                var item = [{
                    faction: pageData.Bidders[pageData.currentBidderId].pendingBid_faction,
                    bid: pageData.Bidders[pageData.currentBidderId].pendingBid_cost,
                }];
                bidderControl.TryAddItem(item);
                setTimeout(function () {
                    biddingControl.UnSelectAll_BidFactionButtons();
                    biddingControl.UnSelectAll_BidCostButtons();
                }, 250);
            }
        },
        SelectBidButton: function (button) {
            var classes = button.classList;
            if (!classes.contains("bidselected")) {
                classes.add("bidselected");
            } else {
                classes.remove("bidselected");
            }
        },
        UnSelectAll_BidFactionButtons: function () {
            var bid_fact_buttons = document.getElementsByName('bid-fact-button');
            for (let l = 0; l < bid_fact_buttons.length; l++) {
                var classes = bid_fact_buttons[l].classList;
                if (classes.contains("bidselected")) {
                    classes.remove("bidselected");
                }
            }
        },
        UnSelectAll_BidCostButtons: function () {
            var bid_cost_buttons = document.getElementsByName('bid-cost-button');
            for (let l = 0; l < bid_cost_buttons.length; l++) {
                var classes = bid_cost_buttons[l].classList;
                if (classes.contains("bidselected")) {
                    classes.remove("bidselected");
                }
            }
        },
        getZeroBidFactionItem: function (fact) {
            return {
                faction: fact,
                bid: 0
            };
        },
    };

    // MARGINAL HARM CALCULATION
    var VCG = {
        Pack: function () {
            var valid = true;
            var errorMsg = "";
            // init
            VCG.ConvertBids(); // to Number()
            VCG.RemoveInvalidBids(); // remove any 0 value items (from pageData.Bidders.Items)

            // compare Fact count to Bidder count
            var factCount = bidderControl.GetFactionCount();
            if (factCount != pageData.Bidders.length) {
                errorMsg += "Invalid players count to factions count. ";
                valid = false;
            }

            // Make sure that no bidder has multiple items for the same Fact
            for (var pIndex = 0; pIndex < pageData.Bidders.length; pIndex++) {
                var uniqueBidCount = uniquePropertyCount(pageData.Bidders[pIndex].Items, 'faction');
                var subtotalBidCount = pageData.Bidders[pIndex].Items.length;
                if (uniqueBidCount !== subtotalBidCount) {
                    errorMsg += "Bidder " + pageData.Bidders[pIndex].Name + " has duplicate faction bid. ";
                    valid = false;
                }
            }

            // Make sure that there are no items for non-added Facts
            if (!VCG.VerifyFactsValid()) {
                errorMsg = "Invalid faction bid - faction not present. "
                valid = false;
            }

            // Add dummy item entries for any missing Fact Items
            if (valid) {
                VCG.PadBids(); // add 0s
            }

            // setup base bid group, and variance bid packs for each missing player
            if (valid) {
                var BidGroups = _.cloneDeep(pageData.Bidders);
                var tempBidGroups = _.cloneDeep(pageData.Bidders);
                var VarianceBidGroups = [];
                var emptyBid = VCG.GetEmptyBidGroup();
                // set up bid sets with 1 missing bidder each
                for (var x = 0; x < BidGroups.length; x++) {
                    tempBidGroups = _.cloneDeep(BidGroups);
                    tempBidGroups.splice(x, 1, emptyBid);
                    VarianceBidGroups.push(tempBidGroups);
                }
            }

            // results
            var WinningBidPack;
            var PackValues = {
                ItemPacks: [],
                Values: [],
                Bets: []
            };
            var VariancePackValues = [];
			var ItemPacks = [];

            if (valid) {
                // VALID Pack
                // show loading spinner
                setloader(true);

                // allow loading display to show
                setTimeout(function () {
					// Generate sorted distribution of all possible faction assignments
					ItemPacks = VCG.GetMasterItemPack(BidGroups);
					
                    // Calculate packs with all bidders and sort by highest value first
                    PackValues = VCG.CalculatePackValue(BidGroups, ItemPacks);
                    WinningBidPack = PackValues[0]; // the pack sorted to index 0 is the highest value (and lowest stddev) bid set

                    // Calculate packs for each bid set with 1 missing bidder each
                    for (var y = 0; y < VarianceBidGroups.length; y++) {
                        VariancePackValues.push(VCG.CalculatePackValue(VarianceBidGroups[y], ItemPacks));
                    }
                    VCG.RemoveInvalidBids(); // remove any 0 value items (from pageData.Bidders.Items)
					
					// Sort the variance bid groups so that the most "matching" bid set (with highest value still) is first (makes harm easier to see in detailed results)
					VariancePackValues = VCG.SortPacksByWinningMatchCount(WinningBidPack, VariancePackValues);

                    // Calculate marginal harm and final cost for each bidder
                    var cost = 0;
                    var othercosts = 0;
                    var variancewinvalue = 0;
                    WinningBidPack.FinalCosts = [];
                    for (var z = 0; z < WinningBidPack.Bets.length; z++) {
                        variancewinvalue = VariancePackValues[z][0].Value;
                        othercosts = WinningBidPack.Value - WinningBidPack.Bets[z];
                        cost = variancewinvalue - othercosts;

                        // A bid with marginal harm cost of 0 is an UNCONTESTED BID : this bid did not impact faction assignment or standings
                        if (cost == 0) {
                            switch (pageData.UncontestedPays) {
                                case 'Zero':
                                    cost = 0;
                                    break;
                                case 'One':
                                    if (WinningBidPack.Bets[z] > 0) { // however, only apply the minimum uncontested cost if they ACTUALLY BID on this faction
                                        cost = 1;
                                    } else {
                                        cost = 0; // otherwise, still default cost to 0 (player was assigned a random faction that they DID NOT BID upon)
                                    }
                                    break;
                                case 'Full': // Does this option ever make logical sense?
                                    cost = WinningBidPack.Bets[z]; //  Not really.
                                    break;
                                default:
                                    // default 0
                                    break;
                            }
                        }

                        WinningBidPack.FinalCosts.push(cost);
                    }
                    WinningBidPack.FinalCosts_floor = floorCosts(WinningBidPack.FinalCosts); // subtract lowest bid from all bids, to approach 0

                    // Set display
                    VCG.DisplayResults(pageData.Bidders, WinningBidPack, VariancePackValues);
                    navigateToPage('#results-container');

                    // Hide loading spinner
                    setloader(false);
                }, 100);
            } else {
                // INVALID Pack
                console.log("Error : " + errorMsg); // TBD : Fail with user visible error message
                FOC.resetPage();
            }
        },
        VerifyFactsValid: function () {
            var ret = true;
            var hasInvalid = false;
            for (var pIndex = 0; pIndex < pageData.Bidders.length; pIndex++) {
                hasInvalid = false;
                if (!pageData.Fact.fact_MdC) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'MdC'); }
                if (!pageData.Fact.fact_E) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'E'); }
                if (!pageData.Fact.fact_WA) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'WA'); }
                if (!pageData.Fact.fact_V1) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'V1'); }
                if (!pageData.Fact.fact_RC) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'RC'); }
                if (!pageData.Fact.fact_LC) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'LC'); }
                if (!pageData.Fact.fact_V2) { hasInvalid = hasInvalid || VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'V2'); }
                if (hasInvalid) {
                    ret = false;
                }
            }
            return ret;
        },
        DoesItemContainFaction: function (items, factname) {
            var ret = false;
            var tempindex = items.map(function (x) { return x.faction; }).indexOf(factname);
            if (tempindex != -1) {
                ret = true;
            }
            return ret;
        },
        RemoveFactionFromItem: function (items, factname) {
            var tempindex = items.map(function (x) { return x.faction; }).indexOf(factname);
            if (tempindex != -1) {
                items.splice(tempindex, 1);
            }
        },
        ConvertBids: function () {
            for (var pIndex = 0; pIndex < pageData.Bidders.length; pIndex++) {
                for (var iIndex = pageData.Bidders[pIndex].Items.length - 1; iIndex >= 0; iIndex--) {
                    pageData.Bidders[pIndex].Items[iIndex].bid = Number(pageData.Bidders[pIndex].Items[iIndex].bid);
                }
            }
        },
        RemoveInvalidBids: function () {
            var pRemoval = [];
            var iRemoval = [];
            // flag index for removal
            for (var pIndex = 0; pIndex < pageData.Bidders.length; pIndex++) {
                iRemoval = [];
                for (var iIndex = pageData.Bidders[pIndex].Items.length - 1; iIndex >= 0; iIndex--) { // add in reverse order
                    if (pageData.Bidders[pIndex].Items[iIndex].bid == 0) {
                        iRemoval.push(iIndex);
                    }
                }
                pRemoval.push(iRemoval);
            }
            // perform actual removal
            var temparr = [];
            for (var rpIndex = 0; rpIndex < pRemoval.length; rpIndex++) {
                for (var riIndex = 0; riIndex < pRemoval[rpIndex].length; riIndex++) {
                    temparr = pRemoval[rpIndex];
                    pageData.Bidders[rpIndex].Items.splice(temparr[riIndex], 1);
                }
            }
        },
        PadBids: function () {
            for (var pIndex = 0; pIndex < pageData.Bidders.length; pIndex++) {
                if (pageData.Fact.fact_MdC) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'MdC')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('MdC'));
                    }
                }
                if (pageData.Fact.fact_E) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'E')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('E'));
                    }
                }
                if (pageData.Fact.fact_V1) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'V1')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('V1'));
                    }
                }
                if (pageData.Fact.fact_V2) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'V2')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('V2'));
                    }
                }
                if (pageData.Fact.fact_WA) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'WA')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('WA'));
                    }
                }
                if (pageData.Fact.fact_RC) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'RC')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('RC'));
                    }
                }
                if (pageData.Fact.fact_LC) {
                    if (!VCG.DoesItemContainFaction(pageData.Bidders[pIndex].Items, 'LC')) {
                        pageData.Bidders[pIndex].Items.push(biddingControl.getZeroBidFactionItem('LC'));
                    }
                }
            }
        },
        GetFactValue: function (items, fact) {
            var ret = 0;
            var result = items.filter(function (obj) {
                return obj.faction === fact
            })[0];
            ret = parseInt(result.bid) || 0;
            return ret;
        },
        GetEmptyBidGroup: function () {
            var retEmptyGroup = {
                Items: [],
            };
            if (pageData.Fact.fact_MdC) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('MdC')); }
            if (pageData.Fact.fact_E) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('E')); }
            if (pageData.Fact.fact_WA) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('WA')); }
            if (pageData.Fact.fact_V1) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('V1')); }
            if (pageData.Fact.fact_RC) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('RC')); }
            if (pageData.Fact.fact_LC) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('LC')); }
            if (pageData.Fact.fact_V2) { retEmptyGroup.Items.push(biddingControl.getZeroBidFactionItem('V2')); }
            return retEmptyGroup;
        },
        CalculatePackValue: function (BidGroups, ItemPacks) {
            var PackValues = {
                ItemPacks: ItemPacks, // already generated the faction distribution
                Values: [],
                Bets: []
            };
			
			var total = 0;
			var tempval = 0;
			var tempvals = [];
			var tempFinal = [];
			
			// pull values from bids
            for (var j = 0; j < PackValues.ItemPacks.length; j++) {
                total = 0;
                tempvals = [];
                tempFinal = PackValues.ItemPacks[j];
                for (var k = 0; k < tempFinal.length; k += 2) {
                    tempval = VCG.GetFactValue(BidGroups[tempFinal[k]].Items, tempFinal[k + 1]);
                    tempvals.push(tempval);
                    total += tempval;
                }
                PackValues.Bets.push(tempvals);
                PackValues.Values.push(total);
            }

            // FINAL PACK it together
            var FinalPack = [];
            var standardDeviation = 0;
            for (var l = 0; l < PackValues.ItemPacks.length; l++) {
                standardDeviation = VCG_math.stdDev(PackValues.Bets[l]);
                FinalPack.push({
                    ItemPacks: PackValues.ItemPacks[l],
                    Bets: PackValues.Bets[l],
                    Value: PackValues.Values[l],
                    stdDev: standardDeviation
                });
            }

			// Sort by Value (highest), then StandardDeviation (lowest)
			FinalPack.sort(valuecompare);

			return FinalPack;
        },
		GetMasterItemPack: function (BidGroups) { // calculate sorted distribution of all possible faction assignments
			var pList = [];
			for (var pIndex = 0; pIndex < BidGroups.length; pIndex++) {
				pList.push(pIndex);
			}
			var fList = [];
			if (pageData.Fact.fact_MdC) { fList.push('MdC'); }
			if (pageData.Fact.fact_E) { fList.push('E'); }
			if (pageData.Fact.fact_WA) { fList.push('WA'); }
			if (pageData.Fact.fact_V1) { fList.push('V1'); }
			if (pageData.Fact.fact_RC) { fList.push('RC'); }
			if (pageData.Fact.fact_LC) { fList.push('LC'); }
			if (pageData.Fact.fact_V2) { fList.push('V2'); }
			
			// find all possible cartesian matches
			let cartesianProd = VCG_math.cartesianProductOf(pList, fList);
			var topAxis = cartesianProd;
			var leftAxis = cartesianProd;
			for (var pIndex = 0; pIndex < BidGroups.length - 1; pIndex++) {
				var resultAxis = VCG_math.cartesianAxis(topAxis, leftAxis);
				topAxis = resultAxis;
			}

			var results = [];
			var tempRes = [];
			// sort all entries to ordered strings
			for (var cIndex = 0; cIndex < resultAxis.length; cIndex++) {
				tempRes = [];
				for (var x = 0; x < BidGroups.length; x++) {
					for (var y = 0; y < resultAxis[cIndex].length; y++) {
						if (resultAxis[cIndex][y] === x) {
							tempRes.push(resultAxis[cIndex][y]);
							tempRes.push(resultAxis[cIndex][y + 1]);
						}
					}
				}
				results.push(tempRes.join(','));
			}

			var tempUniq = [];
			// take only unique strings
			var uniqueResults = results.filter(function (v) {
				if (tempUniq.indexOf(v.toString()) < 0) {
					tempUniq.push(v.toString());
					return v;
				}
			});

			var tempFinal = [];
			var finalResults = [];
			// format back to array for ease
			for (var z = 0; z < uniqueResults.length; z++) {
				tempFinal = uniqueResults[z].split(',');
				for (var i = 0; i < tempFinal.length; i += 2) {
					tempFinal[i] = parseInt(tempFinal[i]);
				}
				finalResults.push(tempFinal);
			}
			
			return finalResults;
		},
        DisplayResults: function (Bidders, WinningBidPack, VariancePackValues) {
            var SecondPlacePack = [];
			var SecondPlaceString = "";
            var tempSecondPlaceString = "";
            var HarmString = "";
			
            for (var x = 0; x < Bidders.length; x++) {
                SecondPlacePack = VariancePackValues[x][0];
                SecondPlaceString = "";

                for (var y = 0; y < SecondPlacePack.Bets.length; y++) {
					tempSecondPlaceString = "P" + (SecondPlacePack.ItemPacks[(y * 2)]+1) + "=" + SecondPlacePack.ItemPacks[(y * 2) + 1];
					if(x == y) {
						tempSecondPlaceString += "</br> "; // self 0 bet (variance)
					} else {
						tempSecondPlaceString += " : " + SecondPlacePack.Bets[y] + " </br> ";	
					}					
					if(x == y) {
						// self
						SecondPlaceString += "<span class='result-color-self'>" + tempSecondPlaceString + "</span>";
					} else {
						if(WinningBidPack.ItemPacks[(y * 2) + 1] != SecondPlacePack.ItemPacks[(y * 2) + 1]) {
							// harmed
							SecondPlaceString += "<span class='result-color-harmed'>" + tempSecondPlaceString + "</span>";
						} else {
							// normal
							SecondPlaceString += tempSecondPlaceString;	
						}
					}
                }				
                HarmString = SecondPlacePack.Value.toString() + " - " + (WinningBidPack.Value - WinningBidPack.Bets[x]).toString() + " = " + (SecondPlacePack.Value - (WinningBidPack.Value - WinningBidPack.Bets[x])).toString();

                Bidders[x].WBid = WinningBidPack.Bets[x];
                Bidders[x].WFact = WinningBidPack.ItemPacks[(x * 2) + 1];
                Bidders[x].Cost = WinningBidPack.FinalCosts[x];
                Bidders[x].Cost_f = WinningBidPack.FinalCosts_floor[x];
                Bidders[x].SecondPlaceResults = SecondPlaceString.toString();
                Bidders[x].Harm = HarmString;
            }

            var resultsTableData = [];
            for (var x = 0; x < Bidders.length; x++) {
                resultsTableData.push({
                    player: Bidders[x].Name,
                    faction: getFactionFullName(Bidders[x].WFact),
                    cost: Bidders[x].Cost_f
                });
            }

            var detailsTableData = [];
            for (var x = 0; x < Bidders.length; x++) {
                detailsTableData.push({
                    player: Bidders[x].ShortName,
                    faction: Bidders[x].WFact,
                    cost: Bidders[x].Cost_f,
                    precost: Bidders[x].Cost,
                    winningbid: Bidders[x].WBid,
                    secondplaceresults: Bidders[x].SecondPlaceResults,
                    harm: Bidders[x].Harm
                });
            }

            defaultResultsTableState();
            refreshResultsTable(resultsTableData);
            refreshDetailsTable(detailsTableData);
        },
		SortPacksByWinningMatchCount: function (WinningBidPack, VariancePackValues) {
			var winValue = 0;
			var curMatchCount = 0;
			var bestMatch = {
				index: 0,
				matchcount: 0,
			}
			var posIndex = [];
			var tempItemPack = [];
			var winningItemPack = WinningBidPack.ItemPacks;
			for(var i = 0; i < VariancePackValues.length; i++) {
				posIndex = [];
				winValue = VariancePackValues[i][0].Value;
				for(var j = 0; j < VariancePackValues[i].length; j++) {
					if(VariancePackValues[i][j].Value == winValue) {
						posIndex.push(j);
					}
				}
				if(posIndex.length > 1){
					bestMatch.index = 0;
					bestMatch.matchcount = 0;
					//find faction set (among all top) that most aligns with factions in winning bid pack
					for(var k = 0; k < posIndex.length; k++) {
						tempItemPack = VariancePackValues[i][posIndex[k]].ItemPacks;
						curMatchCount = VCG.GetPackMatchCount(winningItemPack, tempItemPack);
						if(curMatchCount > bestMatch.matchcount){
							bestMatch.index = posIndex[k];
							bestMatch.matchcount = curMatchCount;
						}
					}
					if(bestMatch.index > 0) {
						// swap the best with the first
						var tempItem = _.cloneDeep(VariancePackValues[i][0]);
						VariancePackValues[i][0] = VariancePackValues[i][bestMatch.index];
						VariancePackValues[i][bestMatch.index] = tempItem;
					}
				}
			}
			return VariancePackValues;
		},
		GetPackMatchCount: function(winningItemPack, tempItemPack) {
			var ret = 0;
			for(var x = 1; x < winningItemPack.length; x += 2) { //compare factions % odd
				if(winningItemPack[x] == tempItemPack[x]){
					ret++;
				}
			}
			return ret;
		},
    };

    // MATH
    var VCG_math = {
        cartesianProductOf: function () {
            return _.reduce(arguments, function (a, b) {
                return _.flatten(_.map(a, function (x) {
                    return _.map(b, function (y) {
                        return x.concat([y]);
                    });
                }), true);
            }, [[]]);
        },
        cartesianAxis: function (cartTopAxis, cartLeftAxis) {
            var retAxis = [];

            var topAxis = [];
            var leftAxis = [];
            var validCombo = true;

            for (var y = 0; y < cartTopAxis.length; y++) {
                topAxis = cartTopAxis[y];
                for (var z = 0; z < cartLeftAxis.length; z++) {
                    leftAxis = cartLeftAxis[z];
                    if (z <= y) {
                        validCombo = true;
                        for (var yy = 0; yy < topAxis.length; yy++) {
                            for (var zz = 0; zz < leftAxis.length; zz++) {
                                // if there is any overlap : discount this combo
                                if (topAxis[yy] == leftAxis[zz]) {
                                    validCombo = false;
                                }
                            }
                        }
                        if (validCombo) {
                            retAxis.push(topAxis.concat(leftAxis));
                        }
                    }
                }
            }
            return retAxis;
        },
        factorial: function (num) {
            if (num < 0) {
                return -1;
            }
            else if (num == 0) {
                return 1;
            }
            else {
                return (num * VCG_math.factorial(num - 1));
            }
        },
        average: function (data) {
            var sum = data.reduce(function (sum, value) {
                return sum + value;
            }, 0);
            var avg = sum / data.length;
            return avg;
        },
        stdDev: function (values) {
            var avg = VCG_math.average(values);

            var squareDiffs = values.map(function (value) {
                var diff = value - avg;
                var sqrDiff = diff * diff;
                return sqrDiff;
            });

            var avgSquareDiff = VCG_math.average(squareDiffs);

            var stdDev = Math.sqrt(avgSquareDiff);
            return stdDev;
        },
    };

    // loader
    var loader = function () {
        setTimeout(function () {
            if ($('#loader').length > 0) {
                $('#loader').removeClass('show');
            }
        }, 1);
    };
    loader(); // INIT, page load

    var setloader = function (isOn) {
        if ($('#loader').length > 0) {
            if (isOn) {
                $('#loader').addClass('show');
            } else {
                $('#loader').removeClass('show');
            }
        }
    };
	
	// donate
	var donatedd = function() {
		var x = "3";
		var mySelect = document.getElementById('donate-dropdown');
		for(var i, j = 0; i = mySelect.options[j]; j++) {
			if(i.value == x) {
				mySelect.selectedIndex = j;
				break;
			}
		}
	};
	donatedd();  // INIT, page load

    // FUNCTION HOOKS
    // home page
    var neg_radios = document.getElementsByName('allowneg');
    for (let y = 0; y < neg_radios.length; y++) {
        let x = y; // IE fix...
        neg_radios[x].addEventListener("click", function () { toggleAllowNeg(x); }, false);
    }
    var pay_radios = document.getElementsByName('uncontestedcost');
    for (let y = 0; y < pay_radios.length; y++) {
        let x = y; // IE fix...
        pay_radios[x].addEventListener("click", function () { setUncontestedPayment(pay_radios[x].value); }, false);
    }
    var fact_buttons = document.getElementsByName('fact-button');
    for (let y = 0; y < fact_buttons.length; y++) {
        let x = y; // IE fix...
        fact_buttons[x].addEventListener("click", function (e) { toggleFaction(e.target, fact_buttons[x].value); }, false);
    }
    // nav
    var navHome = document.getElementsByName('nav-home')[0];
    navHome.addEventListener("click", function () { FOC.resetPage(); }, false);
    var start = document.getElementsByName('start-button')[0];
    start.addEventListener("click", function () { FOC.startBidding(); }, false);
    var next = document.getElementsByName('entry-next-button')[0];
    next.addEventListener("click", function () { FOC.moveToNextEntry(); }, false);
    var done = document.getElementsByName('results-done-button')[0];
    done.addEventListener("click", function () { FOC.resetPage(); }, false);
    var details = document.getElementsByName('results-details-button')[0];
    details.addEventListener("click", function () { toggleResultsTableState(); }, false);
    var navAbout = document.getElementsByName('footer-about-button')[0];
    navAbout.addEventListener("click", function () { FOC.toggleAboutDisplay(); }, false);
    // bid
    var bid_fact_buttons = document.getElementsByName('bid-fact-button');
    for (let y = 0; y < bid_fact_buttons.length; y++) {
        let x = y; // IE fix...
        bid_fact_buttons[x].addEventListener("click", function (e) {
            biddingControl.ChooseBidFaction(e.target, bid_fact_buttons[x].value);
        }, false);
    }
    var bid_cost_buttons = document.getElementsByName('bid-cost-button');
    for (let y = 0; y < bid_cost_buttons.length; y++) {
        let x = y; // IE fix...
        bid_cost_buttons[x].addEventListener("click", function (e) {
            biddingControl.ChooseBidCost(e.target, bid_cost_buttons[x].value);
        }, false);
    }

})(jQuery);