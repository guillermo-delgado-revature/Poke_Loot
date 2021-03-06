using Microsoft.Extensions.Logging;
using RepositoryModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BuisinessLayerMethods
{
    public class RarityMethods : IRarityMethods
    {
        public readonly P3Context context;
        private readonly ILogger<LeaderboardModel> logger;
        public RarityMethods(P3Context context, ILogger<LeaderboardModel> logger)
        {
            this.logger = logger;
            this.context = context;
        }

        /// <summary>
        /// Constructor for leaderboard class that takes a Db context
        /// </summary>
        /// <param name="context">Db context</param>
        public RarityMethods(P3Context context)
        {
            this.context = context;
        }

        /// <summary>
        /// Constructor for leaderboard class that takes no constructor
        /// </summary>
        public RarityMethods()
        {
            this.context = new P3Context();
        }

        /// <summary>
        /// Returns List of UsersRarityMapperMethods by who has the most Cards of a Rarity Category
        /// <param name="rarityCategory">description</param>
        /// </summary>
        public List<UserRarityMapperModel> UserListByMostRarityCategory(string rarityCategory, int maxnumber)
        {

            List<UserRarityMapperModel> result = new List<UserRarityMapperModel>();
            //List<User> users = context.Users.ToList();
            //List<CardCollection> cardcollections = context.CardCollections.ToList();
            //List<RarityType> rare = context.RarityTypes.ToList();
            //List<PokemonCard> pokemoncard = context.PokemonCards.ToList();


            try
            {
                // Query List of UserIds and Quantities by Most Rarity Category in form of Key value Pairs
                var topUsers = (from u in context.Users.ToList()
                                    // Join all four tables
                                join c in context.CardCollections.ToList() on u.UserId equals c.UserId
                                join p in context.PokemonCards.ToList() on c.PokemonId equals p.PokemonId
                                join r in context.RarityTypes.ToList() on p.RarityId equals r.RarityId
                                where r.RarityCategory == rarityCategory.Trim()
                                // Group by User ID
                                group c by c.UserId into GroupModel
                                orderby GroupModel.Count() descending 
                                select new UserRarityMapperModel
                                {
                                    UserId= GroupModel.Key,
                                    UserName= GroupModel.First().User.UserName,
                                    
                                    Quantity = GroupModel.Sum(x => x.QuantityNormal) + GroupModel.Sum(x => x.QuantityShiny),
                                }

                             ).OrderByDescending(o => o.Quantity).Take(maxnumber).ToList();
                // Create List of Users from list of Key value pairs
            //    foreach (var userDic//t in topUsers)
            //    {
            //        var user = context.Users.Where(x => x.UserId == userDict.Key).FirstOrDefault();
            //        UserRarityMapperModel model = new UserRarityMapperModel()
            //        {
            //            UserId = user.UserId,
            //            UserName = user.UserName,
                        //TotalCommon = TotalRarityCategoryForUser(user.UserId, "Common"),
                        //TotalUncommon = TotalRarityCategoryForUser(user.UserId, "Uncommon"),
                        //TotalRare = TotalRarityCategoryForUser(user.UserId, "Rare"),
            //            TotalMythic = TotalRarityCategoryForUser(user.UserId, "Mythic"),
                        //TotalLegendary = TotalRarityCategoryForUser(user.UserId, "Legendary")
           //         };
             //       result.Add(model);
             //   }
                return topUsers;
            }
            catch(Exception e)
            {
                return result;
            }
        }
        /// <summary>
        /// Returns Percent of User's Total Cards of a Rarity Category
        /// </summary>
        public int PercentOfRarityCategory(int userId, string rarityCategory)
        {
            var result = 0;
            // Find Rarity Id for Selected Category 
            int rarityId = context.RarityTypes.Where(x => x.RarityCategory == rarityCategory).FirstOrDefault().RarityId;
            // Collects Total # of Cards of the Selected Category in Database
            decimal totalRarityCards = context.PokemonCards.Where(x => x.RarityId == rarityId).Count();
            // Collects Total # of Cards of the Selected Category that the User owns
            decimal totalRarityCardsOfUser = (from c in context.CardCollections
                                              join p in context.PokemonCards on c.PokemonId equals p.PokemonId
                                              where c.UserId == userId && p.RarityId == rarityId
                                              group p by p.PokemonId into GroupModel
                                              select new { }
                         ).Count();
            // Percent of Totals
            result = (int)Math.Round((totalRarityCardsOfUser / totalRarityCards) * 100);
            return result;
        }
        /// <summary>
        /// Returns Total of User's Non Unique Cards of a Rarity Category
        /// </summary>
        public int TotalRarityCategoryForUser(int userId, string rarityCategory)
        {
            int result = 0;
            // Find Rarity Id for Selected Category 
            int rarityId = context.RarityTypes.Where(x => x.RarityCategory == rarityCategory).FirstOrDefault().RarityId;
            // Queries List of Quantities of Cards of a Rarity Category
            var totalRarityCardsOfUser = (from c in context.CardCollections
                                          join p in context.PokemonCards on c.PokemonId equals p.PokemonId
                                          where c.UserId == userId && p.RarityId == rarityId
                                          select new
                                          {
                                              RarityId = p.RarityId,
                                              Quantity = c.QuantityNormal + c.QuantityShiny
                                          }
                         ).Sum(x => x.Quantity);
            // Sums Quantity in Query
            //foreach (var x in totalRarityCardsOfUser)
            //{
            //    result += x.Quantity;
            //}
            return totalRarityCardsOfUser;
        }
    }
}
